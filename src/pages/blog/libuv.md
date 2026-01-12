---
layout: ../../layouts/blog.astro
title: "Libuv"
pubDate: 2025-06-12
description: "A sample document for Microservice "
author: "Mikey Sleevi"
image:
  url: "https://docs.astro.build/assets/rose.webp"
  alt: "The Astro logo on a dark background with a pink glow."
tags: ["service-architecture", "microservices", "architectural-patterns"]
---

# How Libuv Works

## Introduction

Any dive into the inner workings of Node.js [1] cannot be complete without discussing libuv [2]. The first sentence of About Node.js [3] highlights libuv without the reader realizing it.

> As an asynchronous event-driven JavaScript runtime, Node.js is designed to build scalable network applications.

Asynchronous, event-driven runtime is one of the core components of Node.js and it one of the many reasons why it has become so popular today [4]. Possibly the single most fundamental, and most discussed piece of Node.js is the **Event Loop** [5]. It is the heart of the Node.js runtime and will be the center piece of any discussion. The Node.js Event Loop has a backbone that exists in a separate library. That library being libuv.

## What is Libuv?

When you start reading about libuv, you will likely stumble upon the tagline for the library which can be found on Github. That tagline being:

> libuv is a multi-platform support library with a focus on asynchronous I/O [2]

This highlights the core focus of the library, and gives insight into just how important it is for the foundations of Node.js. Libuv arose as an abstraction over libev [6], which itself was modelled after libevent [7]. All of which themselves are abstractions over system calls like `select` , `poll` and `epoll` or event notification interfaces like `kqueue` . 

Libuv itself boasts a large set of features, the predominant majority of which I will not be tackling in this article. My primary focus in this article will be to draw attention to what I believe is the main feature for the purposes of Node.js. That being:

> *Full-featured event loop backed by epoll, kqueue, IOCP, event ports.* 

I will, however, have the need to touch on some other features in order to fully explain the event loop. Regardless, the exclusive focus of this article will be to help the reader grasp a full understanding of the event loop provided by libuv. 

## The Event Loop

An event loop, for those unfamiliar with the term, is a pattern that waits for and dispatches events. This pattern is often used as a means of handling requests in a single threaded environment. libuv describes their event loop in the following way:

> The event loop is the central part of libuv’s functionality. It takes care of polling for I/O and scheduling callbacks to be run based on different sources of events

Which falls in line with our definition of an event pattern. In fact, libuv's event pattern is special implementation called a Reactor Pattern. Libuv, like any implementation of a particular pattern, has it's own special pieces to the pattern. The special pieces are the primary means of talking about the event loop, called phases.

The phases of the libuv event loop are as follows:

- Timer
- Pending
- Idle
- Prepare
- I/O
- Check
- Close

These are represented both in the internal data structure, as well as the looping code itself. One of the hardest ways to understand a system is to read the code, however it is certainly the canonical source. While we have talked about the concepts surrounding the event loop, it might help to see the data structure and representation in code.

The following is a representation of the loop in libuv. This data structure is responsible for handling any data that will be needed during any of the phases.

```c
struct uv_loop_s {
 void* data;
 unsigned int active_handles;
 void* handle_queue[2];
 union {
   void* unused[2];
   unsigned int count;
 } active_reqs;
 unsigned int stop_flag;
 UV_LOOP_PRIVATE_FIELDS
};
```

This, by itself, is not wildly useful. The majority of the useful information is contained in the `UV_LOOP_PRIVATE_FIELDS` which is defined below.

```c
#define UV_LOOP_PRIVATE_FIELDS                                                
 ...                                                          
 void* pending_queue[2];                                                     
 void* watcher_queue[2];                                                     
 uv__io_t** watchers;                                                        
 ...                                                                                                                        
 uv_mutex_t wq_mutex;                                                        
 uv_async_t wq_async;                                                        
 uv_rwlock_t cloexec_lock;                                                   
 uv_handle_t* closing_handles;                                               
 void* process_handles[2];                                                   
 void* prepare_handles[2];                                                   
 void* check_handles[2];                                                     
 void* idle_handles[2];                                                      
 void* async_handles[2];                                                     
...                                                          
 struct {                                                                    
   void* min;                                                                
   unsigned int nelts;                                                       
 } timer_heap;                                                               
 ...
```

There are ton of fields not represented here, but I want to call out the handles, which are prefixed with the phase names that they correspond to. The data structure itself though does not constitute all the pieces of the runtime, there needs to be some mechanism of execution. The execution of the event loop also highlights the phases very distinctly. The code for the runtime is provided below.

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
 ...
 r = uv__loop_alive(loop);
 if (!r)
   uv__update_time(loop);

 while (r != 0 && loop->stop_flag == 0) {
   uv__update_time(loop);
   uv__run_timers(loop);
   ran_pending = uv__run_pending(loop);
   uv__run_idle(loop);
   uv__run_prepare(loop);
  ...
   uv__io_poll(loop, timeout);
   uv__run_check(loop);
   uv__run_closing_handles(loop);
  ...
 }
 ...
}
```

As you can see, there is again a suffix indicating the phase that the function corresponds to. I want to call special attention to a particular aspect of the event loop, which is `uv__update_time`. One of the foundational components of the event loop is time. In this sense, time is relative to the process and does not require a high level of precision. However, it needs to be progressing at an expected interval in order to function properly (TODO: CITE SOMETHING).

The code for libuv is interesting enough, but for most readers will be insufficient to truly grasp an understanding of the library. I find that illustrations tend to help guide the conversation in a structured manner. So as we discuss each phase, I would like to provide two images to guide an understanding.

The first is a representation of the event loop itself, this is the graphical equivalent of `uv_loop_s` for the intent of this article. This highlights the core data structures in place, and collapse some of the phases to the minimum set utilized by Node.js.


![Event Loop](../../assets/libuv_event_loop.png)


// TODO: Why does not reduce the event loop to four phases

The second is just an encapsulation of the phases within the event loop. This is accurate to the function of Libuv itself. And while Node.js will collapse Pending, Idle, Prepare and I/O Poll into one phase. Libuv supports additionally functionality beyond the scope of just Node.js.

![Libuv Phases](../../assets/libuv_loop.png)

## Phases of the Event Loop

```c
int uv_run(uv_loop_t* loop, uv_run_mode mode) {
 ...
 r = uv__loop_alive(loop);
 if (!r)
   uv__update_time(loop);

 while (r != 0 && loop->stop_flag == 0) {
   uv__update_time(loop);
   uv__run_timers(loop);
   ran_pending = uv__run_pending(loop);
   uv__run_idle(loop);
   uv__run_prepare(loop);
  ...
   uv__io_poll(loop, timeout);
   uv__run_check(loop);
   uv__run_closing_handles(loop);
  ...
 }
 ...
}
```

## Timer

![](../../assets/libuv_timer.png)

```c
void uv__run_timers(uv_loop_t* loop) {
 struct heap_node* heap_node;
 uv_timer_t* handle;

 for (;;) {
   heap_node = heap_min(timer_heap(loop));
   if (heap_node == NULL)
     break;

   handle = container_of(heap_node, uv_timer_t, heap_node);
   if (handle->timeout > loop->time)
     break;

   uv_timer_stop(handle);
   uv_timer_again(handle);
   handle->timer_cb(handle);
 }
}
```

## Pending

![](../../assets/libuv_pending.png)

```c
static int uv__run_pending(uv_loop_t* loop) {
 QUEUE* q;
 QUEUE pq;
 uv__io_t* w;

 if (QUEUE_EMPTY(&loop->pending_queue))
   return 0;

 QUEUE_MOVE(&loop->pending_queue, &pq);

 while (!QUEUE_EMPTY(&pq)) {
   q = QUEUE_HEAD(&pq);
   QUEUE_REMOVE(q);
   QUEUE_INIT(q);
   w = QUEUE_DATA(q, uv__io_t, pending_queue);
   w->cb(loop, w, POLLOUT);
 }

 return 1;
}
```

## Idle

![](../../assets/libuv_idle.png)

```c
#define UV_LOOP_WATCHER_DEFINE(name, type)                                                                                                             
 ...
 void uv__run_##name(uv_loop_t* loop) {                                      
   uv_##name##_t* h;                                                         
   QUEUE queue;                                                              
   QUEUE* q;                                                                 
   QUEUE_MOVE(&loop->name##_handles, &queue);                                
   while (!QUEUE_EMPTY(&queue)) {                                            
     q = QUEUE_HEAD(&queue);                                                 
     h = QUEUE_DATA(q, uv_##name##_t, queue);                                
     QUEUE_REMOVE(q);                                                        
     QUEUE_INSERT_TAIL(&loop->name##_handles, q); 
     h->name##_cb(h);                                                        
   }                                                                       
 }
```

## Prepare

![](../../assets/libuv_prepare.png)

```c
#define UV_LOOP_WATCHER_DEFINE(name, type)                                                                                                             
 ...
 void uv__run_##name(uv_loop_t* loop) {                                      
   uv_##name##_t* h;                                                         
   QUEUE queue;                                                              
   QUEUE* q;                                                                 
   QUEUE_MOVE(&loop->name##_handles, &queue);                                
   while (!QUEUE_EMPTY(&queue)) {                                            
     q = QUEUE_HEAD(&queue);                                                 
     h = QUEUE_DATA(q, uv_##name##_t, queue);                                
     QUEUE_REMOVE(q);                                                        
     QUEUE_INSERT_TAIL(&loop->name##_handles, q); 
     h->name##_cb(h);                                                        
   }                                                                       
 }
```

## I/O Poll

![](../../assets/libuv_iopoll.png)

```c
void uv__io_poll(uv_loop_t* loop, int timeout) {
 ...
 while (!QUEUE_EMPTY(&loop->watcher_queue)) {
   ...
   w = QUEUE_DATA(q, uv__io_t, watcher_queue);
   ...
   w->events = w->pevents;
 }
    ...
    nfds = epoll_wait(loop->backend_fd, events, ARRAY_SIZE(events), timeout);
   for (i = 0; i < nfds; i++) {
     ...
     w = loop->watchers[fd];
     ...
     pe->events &= w->pevents | POLLERR | POLLHUP;
    ...
   }
  ...
}
```

## Check

![](../../assets/libuv_check.png)

```c
#define UV_LOOP_WATCHER_DEFINE(name, type)                                                                                                             
 ...
 void uv__run_##name(uv_loop_t* loop) {                                      
   uv_##name##_t* h;                                                         
   QUEUE queue;                                                              
   QUEUE* q;                                                                 
   QUEUE_MOVE(&loop->name##_handles, &queue);                                
   while (!QUEUE_EMPTY(&queue)) {                                            
     q = QUEUE_HEAD(&queue);                                                 
     h = QUEUE_DATA(q, uv_##name##_t, queue);                                
     QUEUE_REMOVE(q);                                                        
     QUEUE_INSERT_TAIL(&loop->name##_handles, q); 
     h->name##_cb(h);                                                        
   }                                                                       
 }
```

## Close

![](../../assets/libuv_close.png)

```c
static void uv__run_closing_handles(uv_loop_t* loop) {
 uv_handle_t* p;
 uv_handle_t* q;

 p = loop->closing_handles;
 loop->closing_handles = NULL;

 while (p) {
   q = p->next_closing;
   uv__finish_close(p);
   p = q;
 }
}
```

# Summary

# References

1. [https://nodejs.org/](https://nodejs.org/en/)
2. [https://github.com/libuv/libuv](https://github.com/libuv/libuv)
3. [https://nodejs.org/en/about/](https://nodejs.org/en/about/)
4. [https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-other-frameworks-libraries-and-tools](https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-other-frameworks-libraries-and-tools)
5. [https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#what-is-the-event-loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#what-is-the-event-loop)
6. [https://github.com/enki/libev](https://github.com/enki/libev)
7. [https://github.com/libevent/libevent](https://github.com/libevent/libevent)
8. [https://acemood.github.io/2016/02/01/event-loop-in-javascript/](https://acemood.github.io/2016/02/01/event-loop-in-javascript/)
9. [https://www.youtube.com/watch?v=sGTRmPiXD4Y](https://www.youtube.com/watch?v=sGTRmPiXD4Y)
10. [https://gist.github.com/trevnorris/1f3066ccb0fed9037afa](https://gist.github.com/trevnorris/1f3066ccb0fed9037afa)
11. [https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
12. [https://blog.libtorrent.org/2012/10/asynchronous-disk-io/](https://blog.libtorrent.org/2012/10/asynchronous-disk-io/)
13. [https://www.youtube.com/watch?v=zphcsoSJMvM](https://www.youtube.com/watch?v=zphcsoSJMvM)
14. [https://www.youtube.com/watch?v=PNa9OMajw9w](https://www.youtube.com/watch?v=PNa9OMajw9w)
15. [https://www.dynatrace.com/news/blog/all-you-need-to-know-to-really-understand-the-node-js-event-loop-and-its-metrics/#disqus_thread](https://www.dynatrace.com/news/blog/all-you-need-to-know-to-really-understand-the-node-js-event-loop-and-its-metrics/#disqus_thread)
16. [https://www.youtube.com/watch?v=P9csgxBgaZ8](https://www.youtube.com/watch?v=P9csgxBgaZ8)
17. [http://docs.libuv.org/en/latest/design.html#the-i-o-loop](http://docs.libuv.org/en/latest/design.html#the-i-o-loop)
18. [https://medium.com/@copyconstruct/nonblocking-i-o-99948ad7c957](https://medium.com/@copyconstruct/nonblocking-i-o-99948ad7c957)
