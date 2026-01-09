---
layout: ../../layouts/blog.astro
title: 'Tips and Tricks for Context Management in Golang'
pubDate: 2025-06-12
description: 'A sample document for Microservice '
author: 'Mikey Sleevi'
image:
    url: 'https://docs.astro.build/assets/rose.webp'
    alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["service-architecture", "microservices", "architectural-patterns"]
---
# Context Management

1. Never wrap `context` in a struct, always pass it explicitly
2.  Avoid chaining `context`
3. If you are passed a `context`, prefer continuing to pass it through the entire call chain
4. Avoid using `context.Background()`
5. Minimize `context` stores
6. Prefer type-safe access to `context` values
7. goroutines associated with a `context` must be properly terminated and should check against cancellation and deadlines.

Below are some counter-examples for each point, a brief description of the problem and solutions for each type. Where possible, additional references are provided to convince readers that others far more experienced in Golang have encountered these problems and also provide these recommendations.

- [Context Management](#context-management)
  - [Never wrap `context` in a struct, always pass it explicitly](#never-wrap-context-in-a-struct-always-pass-it-explicitly)
    - [Antipattern](#antipattern)
    - [Problem](#problem)
    - [Solution](#solution)
  - [Avoid chaining `context`](#avoid-chaining-context)
    - [Antipattern](#antipattern-1)
    - [Problem](#problem-1)
    - [Solution](#solution-1)
  - [If you are passed a `context`, prefer continuing to pass it through the entire call chain](#if-you-are-passed-a-context-prefer-continuing-to-pass-it-through-the-entire-call-chain)
    - [Antipattern](#antipattern-2)
    - [Problem](#problem-2)
    - [Solution](#solution-2)
  - [Avoid using `context.Background()`](#avoid-using-contextbackground)
    - [Antipattern](#antipattern-3)
    - [Problem](#problem-3)
    - [Solution](#solution-3)
  - [Minimize `context` stores](#minimize-context-stores)
    - [Antipattern](#antipattern-4)
    - [Problem](#problem-4)
    - [Solution](#solution-4)
  - [Prefer type-safe access to `context` values](#prefer-type-safe-access-to-context-values)
    - [Antipattern](#antipattern-5)
    - [Problem](#problem-5)
    - [Solution](#solution-5)
  - [goroutines associated with a `context` must be properly terminated and should check against cancellation and deadlines.](#goroutines-associated-with-a-context-must-be-properly-terminated-and-should-check-against-cancellation-and-deadlines)
    - [Antipattern](#antipattern-6)
    - [Problem](#problem-6)
    - [Solution](#solution-6)
- [References](#references)


## Never wrap `context` in a struct, always pass it explicitly

It often feels like you should wrap related variables in a struct, however, this use is often for things that aren't shared. `context` is one of those shared objects, that doesn't seem like it at first glance. Here is a common anti-pattern structure with using `context` within structs. [1](https://go.dev/blog/context-and-structs)

### Antipattern

```go
type Worker struct {
  ctx context.Context
}

func New(ctx context.Context) *Worker {
  return &Worker{ctx: ctx}
}

func (w *Worker) Fetch() (*Work, error) {
  _ = w.ctx // A shared w.ctx is used for cancellation, deadlines, and metadata.
}

func (w *Worker) Process(work *Work) error {
  _ = w.ctx // A shared w.ctx is used for cancellation, deadlines, and metadata.
}
```

### Problem

> The `(*Worker).Fetch` and `(*Worker).Process` method both use a context stored in Worker. This prevents the callers of Fetch and Process (which may themselves have different contexts) from specifying a deadline, requesting cancellation, and attaching metadata on a per-call basis. For example: the user is unable to provide a deadline just for `(*Worker).Fetch`, or cancel just the `(*Worker).Process` call. The caller’s lifetime is intermingled with a shared context, and the context is scoped to the lifetime where the `Worker` is created.

In the example above, who controls the `ctx` for each worker? What happens when that shared `ctx` is cancelled? This is directly tied to the point around "chaining context". When the `ctx` is passed in a struct, it becomes ambiguous as to who owns the lifetime. Instead you should do something like the following.

### Solution

```go
// Worker fetches and adds works to a remote work orchestration server.
type Worker struct { /* … */ }

type Work struct { /* … */ }

func New() *Worker {
  return &Worker{}
}

func (w *Worker) Fetch(ctx context.Context) (*Work, error) {
  _ = ctx // A per-call ctx is used for cancellation, deadlines, and metadata.
}

func (w *Worker) Process(ctx context.Context, work *Work) error {
  _ = ctx // A per-call ctx is used for cancellation, deadlines, and metadata.
}
```

## Avoid chaining `context`

Chaining context refers to passing the same context to multiple handlers. This may result in problematic management of deadlines, cancellation and values. Here is a common anti-pattern structure related to chaining contexts. [2](https://rodaine.com/2020/07/break-context-cancellation-chain/)

### Antipattern

```go
func Handle(w http.ResponseWriter, req *http.Request) {
	// ex: unmarshal JSON or query parameters
	input := readInput(req)

	// performs the actual business logic
	out, err := DoSomething(req.Context(), input)

	// shadow the new implementation out-of-band
	go shadow(req.Context(), input, out, err)

	// write the output or error to the caller
	writeOutput(w, out, err)
}

func shadow(ctx context.Context, input *Input, expectedOut *Output, expectedErr error) {
	// execute the new implementation wtih the same inputs
	newOut, newErr := DoSomethingBetter(ctx, input)

	// compare results and emit data
	reportComparison(ctx, Comparison{
		Input:          input,
		ExpectedOutput: expectedOut,
		ExpectedError:  expectedErr,
		NewOutput:      newOut,
		NewError:       newErr,
	})
}
```

### Problem

> In our case, while the `shadow` function is running concurrently, `Handle` may have finished writing the response and returned, which results in the `req.Context.Done` channel being closed. Anywhere the context is used past that point will result in the cancellation error. To understand how we can overcome this, we need to grok context’s design

This highlights the problem with both the previous and this. If we don't explicitly control the lifecycles as we pass around `context` it will allow potential downstream functions to cancel the context and result in unexpected termination of other calls with that same `context`.

### Solution

```go
func Handle(w http.ResponseWriter, req *http.Request) {
	// ex: unmarshal JSON or query parameters
	input := readInput(req)

	// performs the actual business logic
	out, err := DoSomething(req.Context(), input)

	// create a context for the background work that:
	// - inherits request values
	// - is NOT canceled when the request completes
	bgCtx := context.WithoutCancel(req.Context())

	// run "shadow" work out-of-band safely
	go shadow(bgCtx, input, out, err)

	// write the output or error to the caller
	writeOutput(w, out, err)
}

func shadow(ctx context.Context, input *Input, expectedOut *Output, expectedErr error) {
	// optional: add a timeout if shadow work should not run forever
	// ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	// defer cancel()

	// execute new implementation with same inputs
	newOut, newErr := DoSomethingBetter(ctx, input)

	// compare results and emit data
	reportComparison(ctx, Comparison{
		Input:          input,
		ExpectedOutput: expectedOut,
		ExpectedError:  expectedErr,
		NewOutput:      newOut,
		NewError:       newErr,
	})
}
```

## If you are passed a `context`, prefer continuing to pass it through the entire call chain

> At Google, we require that Go programmers pass a `Context` parameter as the first argument to every function on the call path between incoming and outgoing requests. This allows Go code developed by many different teams to interoperate well. It provides simple control over timeouts and cancellation and ensures that critical values like security credentials transit Go programs properly. [3](https://go.dev/blog/context#conclusion)

While I wouldn't advocate for any programming style that Google propagates, they did invent the language and found some use in utilizing `context` throughout the call stack. I think there are almost certainly places where "always" breaks down, I would use your discretion.

### Antipattern

Here is a common anti-pattern with `context` propagation.

```go
package main

import (
    "context"
    "fmt"
    "time"
)

// Bad: function needs a context, but it isn't passed
func FetchData() string {
    // Tries to create a background context instead of using the parent
    ctx := context.Background()

    select {
    case <-time.After(2 * time.Second):
        return "data"
    case <-ctx.Done(): // never triggered from parent
        return "cancelled"
    }
}

// Caller has a real request-scoped context
func HandleRequest(ctx context.Context) {
    // Calls FetchData which ignores the parent context
    data := FetchData()
    fmt.Println("Received:", data)
}
```

### Problem

In the example above, the context is unable to cancel the incoming request. So the parent is never notified that a function completed through the necessary channel.

### Solution 

Instead, we should approach it like this.

```go
func FetchData(ctx context.Context) string {
    select {
    case <-time.After(2 * time.Second):
        return "data"
    case <-ctx.Done():
        return "cancelled"
    }
}

func HandleRequest(ctx context.Context) {
    data := FetchData(ctx)
    fmt.Println("Received:", data)
}\
```

## Avoid using `context.Background()`

> You use `context.Background` when you know that you need an empty context, like in main where you are just starting and you use `context.TODO` when you don’t know what context to use or haven’t wired things up. [4](https://blog.meain.io/2024/golang-context/)

`context.Background()` has some interesting properties. 

1. It is never canceled
2. It has no values
3. It has no deadline

### Antipattern

Here is a common anti-pattern using `context.Background()`

```go
package main

import (
    "context"
    "fmt"
    "time"
)

// BAD: Using context.Background() for a recurring job
func ProcessMetrics() {
    // This context will never be canceled and has no deadline
    ctx := context.Background()

    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            fmt.Println("Processing metrics...")
        case <-ctx.Done(): // useless, never triggers
            fmt.Println("Stopped processing metrics")
            return
        }
    }
}

func main() {
    go ProcessMetrics()

    // Let the job run for 5 seconds
    time.Sleep(5 * time.Second)
    fmt.Println("Exiting main, background job will leak")
}
```

### Problem

In the example above, metrics are never done processing, they will continue indefinitely and we are unable to gracefully terminate the process under any circumstances.

### Solution

Instead we should do something like the following.

```go
func ProcessMetrics(ctx context.Context) {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            fmt.Println("Processing metrics...")
        case <-ctx.Done():
            fmt.Println("Stopped processing metrics")
            return
        }
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    go ProcessMetrics(ctx)

    // Wait until job finishes or timeout
    <-ctx.Done()
    fmt.Println("Main exiting")
}
```

## Minimize `context` stores

In general, storing values in `context` is a generally accepted pattern in Golang. However, what to store is the problem. Let's start with a very important ground rule. [5](https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/)

> Never store values that are not created and destroyed during the lifetime of the request

This includes things like: 

* Loggers
* Database Connections
* Global Variables

### Antipattern

The following is an example anti-pattern.

```go
func Handle(w http.ResponseWriter, req *http.Request) {
	// db is the global database connection pool
	ctx := context.WithValue(ctx, "db", db)
	
	// process is a dangerous function that incorrectly handles database connections
	go process(ctx)

	// write the output or error to the caller
	writeOutput(w, out, err)
}
```

### Problem

The problem here is a naturally concurrency issue. If you spawn several goroutines you could have undefined behavior around access and mutations of any shared variables stored within the `context`.

### Solution

Instead we should use request scoped variables, like this example using an HTTP server.

```go
var requestID = 0

func nextRequestID() int {
  requestID++
  return requestID
}

func addRequestID(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    ctx := context.WithValue(r.Context(), "request_id", nextRequestID())
    next.ServeHTTP(w, r.WithContext(ctx))
  })
}
```

Request Scoped Variables include things like:

* Request ID
* Trace ID
* User ID

When `context` is mismanaged, you tend to get memory leaks. Which provides another reason to keep `context` small. If you start to leak `context`, a slow burn is better than a fast burn.

## Prefer type-safe access to `context` values

> The biggest downside to using `context.WithValue()` and `context.Value()` is that you are actively choosing to give up information and type checking at compile time. You do gain the ability to write more versatile code, but this is a major thing to consider. We use typed parameters in our functions for a reason, so any time we opt to give up information like this it is worth considering whether it is worth the benefits. [5](https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/)

Type safety is generally valuable when possible. `context` is one of the few functions in Golang ecosystem that makes heavy use of `interface{}`, which effectively amounts to `void *`.
### Antipattern

```go
func HandleUser(req *http.Request, userProcessor UserProcessor) *User {
	user := r.Header.Get("X-User")
    ctx := context.WithValue(r.Context(), "user", user)
    timeout := r.URL.Query().Get("timeout")
    ctx = context.WithValue(r.Context(), "timeout", timeout)
    return ProcessUser(ctx, userProcessor)
}

func ProcesssUser(ctx context.Context, userProcessor UserProcessor) *User {
	string user = ctx.Value("user").(string)
	int timeout = ctx.Value("timeout").(int)
	if (timeout < 0) {
		return nil
	}
	
	return userProcessor.process(user)
}
```

### Problem

In the above code, we cannot guarantee that `timeout` is an `int` or even that `user` is something that would have some meaningful value for `user`. We should instead prefer type-safe approaches to `context` management instead of `interface{}` value sets.

### Solution

Instead, we should do something like this.

```go
type userCtxKeyType string

const userCtxKey userCtxKeyType = "user"

func WithUser(ctx context.Context, user *User) context.Context {
  return context.WithValue(ctx, userCtxKey, user)
}

func GetUser(ctx context.Context) *User {
  user, ok := ctx.Value(userCtxKey).(*User)
  if !ok {
    // Log this issue
    return nil
  }
  return user
}
```


## goroutines associated with a `context` must be properly terminated and should check against cancellation and deadlines.

> Contexts in Go are used to manage the lifecycle and cancellation signaling of goroutines and other operations. A root context is usually created, and child contexts can be derived from it. Child contexts inherit cancellation from their parent contexts. If a goroutine is started with a context, but does not properly exit when that context is canceled, it can result in a goroutine leak. The goroutine will persist even though the operation it was handling has been canceled. [6]( https://medium.com/@jamal.kaksouri/the-complete-guide-to-context-in-golang-efficient-concurrency-management-43d722f6eaea)

### Antipattern

Here is an example anti-pattern.

```go
func main() {  
  ctx := context.Background()  
  
  go func(ctx context.Context) {  
    for {  
      select {  
      case <-ctx.Done():  
        // properly handling cancellation  
        return   
      default:  
        // do work  
      }  
    }  
  }(ctx)  
  
  time.Sleep(1 * time.Second)  
  
  cancel() // cancel the context   
}  
  
func cancel() {  
  ctx, cancel := context.WithCancel(context.Background())  
  cancel() // cancel the context  
}
```

### Problem

In this example, the goroutine started with the context does not properly exit when that context is canceled. This will result in a goroutine leak, even though the main context is canceled.

### Solution

```go
func main() {  
  ctx, cancel := context.WithCancel(context.Background())  
  
  go func(ctx context.Context) {  
    for {  
      select {  
      case <-ctx.Done():  
        return // exit properly on cancellation    
      default:  
        // do work  
      }  
    }  
  }(ctx)  
  
  time.Sleep(1 * time.Second)    
  
  cancel()  
}
```

Now the goroutine will cleanly exit when the parent context is canceled, avoiding the leak.

# References

1. https://go.dev/blog/context-and-structs
2. https://rodaine.com/2020/07/break-context-cancellation-chain/
3. https://go.dev/blog/context#conclusion
4. https://blog.meain.io/2024/golang-context/
5. https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/
6. https://medium.com/@jamal.kaksouri/the-complete-guide-to-context-in-golang-efficient-concurrency-management-43d722f6eaea
