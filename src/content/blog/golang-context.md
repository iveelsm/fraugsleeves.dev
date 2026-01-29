---
layout: ../../layouts/blog.astro
title: "Tips and Tricks for Context Management in Go"
pubDate: 2026-01-15
description: "Seven tips for managing Context in Go projects. The tips range from strong suggestions through best practices all the way to hard requirements. Each tip provides a reasonable example of a problematic use, as well as a reasonable counter example for refactoring. Information and tips, where possible, are corroborated with different sources."
author: "Mikey Sleevi"
editors: ["Sam Warfield", "Steve Ruckdashel"]
image:
  url: "https://docs.astro.build/assets/rose.webp"
  alt: "The Astro logo on a dark background with a pink glow."
tags: ["golang", "context", "concurrency", "code-architecture", "best-practice"]
---

# Tips and Tricks for Context Management

This article started as something I would share with teams to help guide their use of `context` within the codebase. It served as a helpful guide for both the inexperienced and experienced engineer making the transition to using Go. The following outlines seven tips for managing `context.Context` in Go. These tips, at a high level, are given below.

1. Never wrap `Context` in a struct, always pass it explicitly
2. Beware of chaining `Context`
3. If you are passed a `Context`, prefer continuing to pass it through the entire call chain
4. Avoid using `context.Background()`
5. Minimize `Context` stores
6. Prefer type-safe access to `Context` values
7. goroutines should be associated with a `Context` and must be properly terminated

Each tip will come with some counter-examples for each point, a brief description of the problem and solutions for each type. Where possible, references are provided to help convince the inquisitive reader. The majority of the examples come from reduced versions found in real production codebases. The problems the exhibit have caused many production bugs and led to initial investigation for the knowledge behind this article.

## Never wrap `Context` in a struct, always pass it explicitly

This one is rather obvious if you have read the documentation, as this is stated as part of the `context` package.

> Do not store Contexts inside a struct type; instead, pass a Context explicitly to each function that needs it. [1](https://pkg.go.dev/context)

We have a tendency as software engineers to bundle related things together. One of the tools we reach for in Go to achieve this bundling is a struct. The problem with bundling `Context` is that you conflate different object life cycles. It may not seem like it at a glance, but `Context` is a shared object. And as a shared object, it often has a different lifecycle than any struct that gets created. As your codebase grows, you come to realize that `context` management becomes a large piece of the concurrency and lifecycle management story. So, here is a common anti-pattern structure with using `Context` within structs. [2](https://go.dev/blog/context-and-structs)

```go
/* An example of problematic context management through struct wrapping. */

// BatchProducer handles batch connection to a database server
type 	BatchProducer struct {
  client *batch.Client
  ctx    context.Context
}

func NewBatchProducer(ctx context.Context, opts []batch.Option) *BatchProducer {
  /* Initial setup... */
  client, _ := batch.New(ctx, opts...)

  return &BatchProducer{
    batch: client,
    ctx:   ctx, // ctx is incorrectly passed into a long lived struct
  }
}

func (bp *BatchProducer) OnRecordSucceeded(metadata any) {
  md, _ := metadata.(*Metadata)
  bp.client.Ack(bp.ctx, md.Delivery, md.Queue)
}

func (bp *BatchProducer) OnRecordRejected(metadata any) {
  md, _ := metadata.(*Metadata)
  bp.client.Nack(bp.ctx, md.Delivery, md.Queue, false)
}
```

**Problem**

In the example above, who controls the `ctx` for each `BatchProducer`? What happens when that shared `ctx` is cancelled? The `(*BatchProducer).OnRecordSucceeded` and `(*BatchProducer).OnRecordRejected` method both use a context stored in `BatchProducer`. This prevents the callers of `OnRecordSucceed` and `OnRecordRejected` (which may themselves have different contexts) from specifying a deadline, requesting cancellation, and attaching metadata on a per-call basis. This creates problems such as incorrect data retrieved, leaking potentially sensitive data, or potential deadlocks. This is directly tied to the point around "chaining context". When the `ctx` is passed in a struct, it becomes ambiguous as to who owns the lifetime. Instead you should do something like the following.

**Solution**

```go
// BatchProducer handles batch connection to a database server
type 	BatchProducer struct {
  client    *batch.Client
}

func NewBatchProducer(ctx context.Context, opts []batch.Option) *BatchProducer {
  /* Initial setup... */

  client, _ := batch.New(ctx, opts...)

  return &BatchProducer{
    batch: client,
  }
}

func (bp *BatchProducer) OnRecordSucceeded(ctx context.Context, metadata any) {
  md, _ := metadata.(*Metadata)
  bp.client.Ack(ctx, md.Delivery, md.Queue)
}

func (bp *BatchProducer) OnRecordRejected(ctx context.Context, metadata any) {
  md, _ := metadata.(*Metadata)
  bp.client.Nack(ctx, md.Delivery, md.Queue, false)
}
```

Now we can push the responsibility of context management onto the caller. So they can construct a child context before calling the functions to protect any context in the calling state.

## Beware of chaining `Context`

Chaining context refers to passing the same context to multiple handlers. In the vast majority of scenarios, chaining context is a preferred approach. Often when you spawn goroutines as part of a request, event or background job, you want to cancel all the goroutines with their respective close. But what if you want something to live beyond the close or cancel?

> Recently, I recalled a useful pattern that’s cropped up a few times at work. API handlers (think http.Handler), include a context.Context tied to the connectivity of the caller. If the client disconnects, the context closes, signaling to the handler that it can fail early and clean itself up. Importantly, the handler function returning also cancels the context.
>
> But what if you want to do an out-of-band operation after the request is complete? [3](https://rodaine.com/2020/07/break-context-cancellation-chain/)

Let's look at the following problematic example.

```go
/* An example of problematic context chaining. */

type Subscription struct { /* ... */ }

type Consumer struct { /* ... */ }

func createAlertSubscribers(ctx context.Context, consumers []Consumer) []*Subscription {
  /* Initial setup... */

  var subs []*Subscription
  for _, consumer := range consumers {
    sub := createSubscriber(consumer)

    go subscribeToConsumer(ctx, sub, &consumer) // Background job bound to request context
    subs = append(subs, sub)
  }

  return subs
}

func subscribeToConsumer(ctx context.Context, subscription *Subscription, consumer *Consumer) {
  for {
    select {
    case <-ctx.Done():
      return // If the request finishes, so does the background job
    default:
      /* Process event.. */
    }
  }
}
```

**Problem**

In the above code, we are trying to create a number of subscription background processes based on a number of expected consumers passed in. These background process will handle events coming off a hypothetical stream. However, we have passed the same `Context` into each goroutine and we have added some additional hypothetical code to demonstrate that the function will respect context cancellation. This means that if the context that was passed in to `createAlertSubscribers` is terminated, then the subscriptions will be terminated. We have tied the lifecycle of the subscriber creation to the ongoing subscription process instead of decoupling the background jobs. This could be especially problematic if `createAlertSubscribers` was called as part of a HTTP request, as the context would cancel as soon as the request finishes.

**Solution**

```go
type Subscription struct { /* ... */ }

type Consumer struct { /* ... */ }

func createAlertSubscribers(ctx context.Context, consumers []Consumer) []*Subscription {
  /* Initial setup... */

  var subs []*Subscription
  for _, consumer := range consumers {
    sub, err := createSubscriber(consumer)
    consumerCtx := context.WithoutCancel(ctx) // Context is separated from the request lifecycle

    go subscribeToConsumer(consumerCtx, sub, &consumer) // Each goroutine gets its own child context
    subs = append(subs, sub)
  }

  return subs
}

func subscribeToConsumer(ctx context.Context, sub *Subscription, consumer *Consumer) {
  for {
    select {
    case <-ctx.Done():
      return
    default:
      /* Process event.. */
    }
  }
}
```

We have now refactored the goroutine to clearly indicate that it is a background process, we have created a cancellation process for the goroutine and the subscription will now continue until the background context is terminated or the subscription process naturally finishes. Phrased differently, the background job is now in control of it's own lifecycle.

## If you are passed a `Context`, prefer continuing to pass it through the entire call chain

> At Google, we require that Go programmers pass a `Context` parameter as the first argument to every function on the call path between incoming and outgoing requests. This allows Go code developed by many different teams to interoperate well. It provides simple control over timeouts and cancellation and ensures that critical values like security credentials transit Go programs properly. [4](https://go.dev/blog/context#conclusion)

I wouldn't advocate for requiring `Context` to always be the first argument in every function, there are plenty of places for reasonably small, pure functions in Go that have no need for knowledge of a request lifecycle. With that being said, the vast majority of your call path should have `Context` propagated throughout it. Here's an example of problematic propagation.

```go
/* An example of missing context propagation. */

// Caller has a real request-scoped context
func HandleRequest(ctx context.Context) {
  /* Initial setup... */
  data := BusinessLogicHandler() // Note that the request context was not passed here.

  /* Post business logic return */
}

func BusinessLogicHandler() string {
  /* Initial setup... */
  ctx := context.TODO() // Placeholder context, since we weren't passed it.
  data := RetrieveData(ctx)
  return data
}

func RetrieveData(ctx context.Context) string {
  /* Retrieve data from a database... */
}
```

**Problem**

In this example, we have a chain of requests that start with a simple request handler that fails to pass the request `Context` to the downstream business logic. This is a common pattern where since the middle section of the business logic does not need to be aware of the request, the author incorrectly assumes that the rest of the call chain does not. Then when we get to our I/O patterns like a database connection, the `Context` becomes relevant again, but we don't have the original request `Context` to pass. So we have to apply a placeholder.

**Solution**

Instead, we should approach it like this.

```go
// Caller has a real request-scoped context
func HandleRequest(ctx context.Context) {
  /* Initial setup... */
  data := BusinessLogicHandler() //

  /* Post business logic return */
}

func BusinessLogicHandler(ctx context.Context) string {
  /* Initial setup... */
  data := RetrieveData(ctx)
  return data
}

func RetrieveData(ctx context.Context) string {
  /* Retrieve data from a database... */
}
```

This seems contrived, but as call chains grow, the likelihood of losing an argument to a function along the way gets higher. With three functions these seems relatively simple, but what happens when the critical path starts to become tens of functions?

## Avoid using `context.Background()`

One of the biggest reasons that this comes up is that people find helpful articles that explain how to use something, but the articles uses `context.Background()` as a placeholder. Authors often do this so they can focus on the library or tooling instead of the context management surrounding the library and tooling. So let's talk about why you should avoid it.

> You use `context.Background` when you know that you need an empty context, like in main where you are just starting and you use `context.TODO` when you don’t know what context to use or haven’t wired things up. [5](https://blog.meain.io/2024/golang-context/)

`context.Background()` has some interesting properties. [9](https://pkg.go.dev/golang.org/x/net/context#Background)

1. It is never cancelled
2. It has no values
3. It has no deadline

This means that: you cannot store or pass any request context, you are completely isolated from the request lifecycle, and the function that you call with it could continue forever without ceasing if you aren't careful. Throughout this article, we have seen `context.Background()` used in problematic ways, but let's look at a more concrete example.

```go
/* An example of problematic `context.Background()` use. */

func RequestHandler(w http.ResponseWriter, r *http.Request) (interface{}, error) {
  /* Initialize request... */
  ctx := r.Context()

  for i := 0; i < 10; i++ {
    if err := sem.Acquire(context.Background(), 1); err != nil { // If the client disconnects, this may block forever.
      return err
    }

    go func(i int) {
      defer sem.Release(1)
      handle(ctx, i) // Cancellation can no longer interrupt semaphore pressure.
    }(i)
  }

  return nil
}

func handle(ctx context.Context, i int) {
  /* Does work for the request... */
}
```

**Problem**

So here we have simple request that operates on some shared resource and the access is controlled through a semaphore. However, since we use `context.Background()` the semaphore acquisition and request handling are not managed with the same life cycles. If clients disconnects or the upstream terminates the request, the semaphore acquisition will continue unnecessarily. This can lead to complex concurrency bugs or excessive resource contention.

**Solution**

Instead we remove the use of `context.Background()`, which will resemble the following.

```go
func RequestHandler(w http.ResponseWriter, r *http.Request) (interface{}, error) {
  /* Initialize request... */
  reqCtx := r.Context()

  ctx, cancel := context.WithCancel(reqCtx)
  defer cancel()

  for i := 0; i < 10; i++ {
    if err := sem.Acquire(ctx, 1); err != nil { // The request and semaphore acquisition are correctly bound together
      return err
    }

    go func(i int) {
      defer sem.Release(1)
      handle(ctx, i)
    }(i)
  }

  return nil
}

func handle(ctx context.Context, i int) {
  /* Does work for the request... */
}
```

We have added some unnecessary child context that is derived from the request context. This is used as an example to demonstrate how you would construct the necessary context in order to avoid the use of `context.Background()`. The primary change is the removal of `context.Background()` in the semaphore acquisition. For the vast majority of scenarios, using the background context is incorrect, whenever you see it, ask yourself if it falls into one of the following scenarios.

- You are constructing a top-level context for your program in somewhere like `main()`
- You are building background goroutines that are intended to be decoupled from a request lifecycle

There are additional scenarios that involve breaking the chain of context, but these can be mostly be avoided with `context.WithoutCancel`. [3](https://rodaine.com/2020/07/break-context-cancellation-chain/)

## Minimize `Context` stores

In general, storing values in `Context` is a generally accepted pattern in Golang. However, what to store is the problem. Let's start with a very important ground rule.

> Never store values in `Context` that are not created and destroyed during the lifetime of the request. [6](https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/)

This includes things like:

- Loggers
- Database Connections
- Global Variables

You will see these statements repeated across many explorations of the `context` package, but why is it so important? Mostly semantics, and as you develop more in Go you start to recognize `Context` as a request scoped object. As this recognition starts to occur, you start to assume that if the object itself is request scoped, then certainly the properties of the object should also be request scoped. This starts to incorrectly signal to others that shared objects may be safe for some forms of concurrent access, as you assume that the current request is the only one acting on it. Additionally, you can create opportunities for accidental cancellation of shared resources or requests. So let's look at an example where a long-lived cache client is passed into an HTTP API.

```go
/* An example of problematic context stores. */

func NewCacheClient(nodes []string) (*memcache.Client) { /* ...*/ }

func startAPI(ctx context.Context) (error) {
  /* Start the HTTP API */
}

func main() {
  /* Parse configuration, setup and retrieve nodes... */
  rootCtx := context.Background() // This is a valid use of `context.Background()` as an root for other context creations
  apiCtx, cancel := context.WithCancel(rootCtx)

  memcache, _ := NewCacheClient(nodes)

  apiCtx = context.WithValue(apiCtx, "memcached", memcache)

  if err := startAPI(apiCtx); err != nil {
    return fmt.Errorf("unable to start api; %w", err)
  }
}
```

**Problem**

In this example, we are really stretching the limits of the problem here. We are going to assume that the memcache client we are constructing is thread-safe, so we can eliminate concurrency issues. So what is a simple demonstration of something that could cause serious problems?

```go
func handler(w http.ResponseWriter, r *http.Request) {
  client := r.Context().Value("memcached").(*memcache.Client)
  defer client.Close()
}
```

This is a common pattern, we have assumed that the memcached client is request bound, and so as a result, since we have ownership of the associated request data, we are closing these resources after the termination of our handler. The obvious problem is that we will close the shared client for every request at the end of our handler function.

**Solution**

Instead we should limit our stores to request scoped variables and pass anything that has a different lifecycle explicitly into the functions that need them.

```go
func NewCacheClient(nodes []string) (*memcache.Client) { /* ... */ }

func startAPI(ctx context.Context, memcache *memcache.Client) (error) {
  /* start the HTTP API */
}

func main() {
  /* Parse configuration, setup and retrieve nodes... */
  rootCtx := context.Background()
  apiCtx, cancel := context.WithCancel(rootCtx)

  memcache, _ := NewCacheClient(nodes)

  if err := startAPI(apiCtx, memcache); err != nil {
    log.Fatalf("unable to start API: %v", err)
  }
}
```

Request scoped variables include things like:

- Request ID
- Trace ID
- User ID

When `context` is almost inevitably mismanaged, you tend to get memory leaks. This provides another reason to keep `context` small and to minimize stores. If you start to leak `context`, a slow burn is better than a fast burn.

## Prefer type-safe access to `Context` values

> The biggest downside to using `context.WithValue()` and `context.Value()` is that you are actively choosing to give up information and type checking at compile time. You do gain the ability to write more versatile code, but this is a major thing to consider. We use typed parameters in our functions for a reason, so any time we opt to give up information like this it is worth considering whether it is worth the benefits. [6](https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/)

Type safety is generally valuable when possible. `context` is one of the few functions in Golang ecosystem that makes heavy use of `interface{}`, which effectively amounts to `void *`.

```go
/* An example of missing types in context stores. */

func HandleUser(req *http.Request, userProcessor UserProcessor) *User {
  user := r.Header.Get("X-User")
  ctx := context.WithValue(r.Context(), "user", user) // We have no control over what user is
  timeout := r.URL.Query().Get("timeout")
  ctx = context.WithValue(r.Context(), "timeout", timeout) // We have no control over what timeout is
  return ProcessUser(ctx, userProcessor)
}

func ProcessUser(ctx context.Context, userProcessor UserProcessor) *User {
	string user = ctx.Value("user").(string)
	int timeout = ctx.Value("timeout").(int)
	if (timeout < 0) {
		return nil
	}

	return userProcessor.process(user)
}
```

**Problem**

In the above code, we cannot guarantee that `timeout` is an `int` or even that `user` is something that would have some meaningful value for `user`. We should instead prefer type-safe approaches to `context` management instead of `interface{}` value sets.

**Solution**

Instead, we should do something like this.

```go
type userCtxKeyType string

const userCtxKey userCtxKeyType = "user"

func WithUser(ctx context.Context, user *User) context.Context {
  return context.WithValue(ctx, userCtxKey, user) // We have type safety on store now
}

func GetUser(ctx context.Context) *User {
  user, ok := ctx.Value(userCtxKey).(*User)
  if !ok {
    return nil
  }
  return user
}
```

In this example, we have clear approaches for retrieving the value associated with the "user" key on a context. We have appropriate stores as well to maintain the type-safety, and it provides a reasonable escape hatch and observability options for detecting when accesses are occurring that break the contract. We can apply this pattern to any store associated with the context to keep the type safety guarantees. We can further extend these type safety guarantees through the use of `panic()` when an incorrect type is detected. This type of misuse would fall well within the Google style guide around **When to panic**. [10](https://google.github.io/styleguide/go/best-practices#program-checks-and-panics)

## goroutines should be associated with a `Context` and must be properly terminated

> Contexts in Go are used to manage the lifecycle and cancellation signaling of goroutines and other operations. A root context is usually created, and child contexts can be derived from it. Child contexts inherit cancellation from their parent contexts. If a goroutine is started with a context, but does not properly exit when that context is canceled, it can result in a goroutine leak. The goroutine will persist even though the operation it was handling has been canceled. [7](https://medium.com/@jamal.kaksouri/the-complete-guide-to-context-in-golang-efficient-concurrency-management-43d722f6eaea)

This is one of the most common example of context and memory leaks in Go. [8](https://www.datadoghq.com/blog/go-memory-leaks/#goroutines) It is incredibly easy to mismanage goroutines in Go. These often manifest in complex and difficult to track ways.

```go
/* An example of improper goroutine handling. */

type Entry struct { /* ... */ }

func EntrySync(context context.Context, entry Entry) {
  /* Performs a synchronization job on entry... */
}

func ThrottledSync(sem *semaphore.Weighted, entries []*Entry) {
  ctx := context.Background()
  for _, entry := range entries {
    if err := sem.Acquire(ctx, 1); err != nil {
      /* Error handling for failed acquisition */
    }

    go func(entry Entry) {
      defer sem.Release(1)
      EntrySync(ctx, entry)
    }(entry)
  }
}

func BulkProcess(w http.ResponseWriter, r *http.Request) (interface{}, error) {
  /* Processing and business logic... */

  sem := semaphore.NewWeighted(int64(10))
  go ThrottledSync(sem, entries)

  /* Handle return... */
}
```

**Problem**

In the example above, we are trying to build a throttled synchronization of several entry objects as part of our bulk request processing. But, we failed to propagate the request context, and so the throttled sync has incorrectly derived it's own context from the background. Furthermore, the entry sync does not indicate that it correctly responds to any cancellation of the incoming context. As a result, even if the request fails, the semaphore acquisition will persist and it's likely that we will leak the entries object and the semaphore.

**Solution**

```go
type Entry struct { /* ... */ }

func EntrySync(context context.Context, entry Entry) {
  select {
  case <-ctx.Done():
    return // Stop work if the request is canceled
  default:
    /* Process entry... */
  }
}

func ThrottledSync(ctx context.Context, sem *semaphore.Weighted, entries []*Entry) {
  for _, entry := range entries {
    if err := sem.Acquire(ctx, 1); err != nil {
      /* Error handling for failed acquisition */
    }

    go func(entry Entry) {
      defer sem.Release(1)
      EntrySync(ctx, entry)
    }(entry)
  }
}

func BulkProcess(w http.ResponseWriter, r *http.Request) (interface{}, error) {
  ctx := r.Context()

  /* Processing and business logic... */

  sem := semaphore.NewWeighted(int64(10))
  go ThrottledSync(ctx, sem, entries)

  /* Handle return... */
}
```

Now the goroutines will close when the request context is cancelled, which avoids the memory leaks, avoids the semaphore acquisition lock issues and still maintains the functionality of the code as previously described.

# References

1. https://pkg.go.dev/context
2. https://go.dev/blog/context-and-structs
3. https://rodaine.com/2020/07/break-context-cancellation-chain/
4. https://go.dev/blog/context#conclusion
5. https://blog.meain.io/2024/golang-context/
6. https://www.calhoun.io/pitfalls-of-context-values-and-how-to-avoid-or-mitigate-them/
7. https://medium.com/@jamal.kaksouri/the-complete-guide-to-context-in-golang-efficient-concurrency-management-43d722f6eaea
8. https://www.datadoghq.com/blog/go-memory-leaks/#goroutines
9. https://pkg.go.dev/golang.org/x/net/context#Background
10. https://google.github.io/styleguide/go/best-practices#program-checks-and-panics
