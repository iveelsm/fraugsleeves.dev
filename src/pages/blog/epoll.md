---
layout: ../../layouts/blog.astro
title: "How epoll Works"
pubDate: 2025-05-07
description: "One of a series of posts around the inner-workings of Node.js, this article seeks to provide a deeper understanding of the asynchronous I/O polling mechanism used by many systems called `epoll`. It explores the concepts of file descriptors, event trigger, `select`, `poll` and `epoll` and their limitations."
author: "Mikey Sleevi"
image:
  url: "https://docs.astro.build/assets/rose.webp"
  alt: "The Astro logo on a dark background with a pink glow."
tags: ["node.js", "asynchronous", "polling", "linux", "c"]
---

# Introduction

The best way to introduce epoll is to introduce the problem that it solves. 

> The classic Unix way to wait for I/O events on multiple file descriptors is with the select() and poll() system calls. When a process invokes one of those calls, the kernel goes through the list of interesting file descriptors, checks to see if non-blocking I/O is available on any of them, and adds the calling process to a wait queue for each file descriptor that would block. This implementation works reasonably well when the number of file descriptors is small. But if a process is managing thousands of file descriptors, the select() and poll() calls must check every single one of them, and add the calling process to thousands of wait queues. For every single call. Needless to say, this approach does not scale very well. [14](https://lwn.net/Articles/13587/)

# File Descriptors

## File Table

## inode Table

## File Descriptors in Practice

### File Descriptor Creation

### File Descriptor Closing

# Event Triggers

## Level Triggers

## Edge Triggers

# `select` and `poll`


# `epoll`

## Triggers


## Performance and Pitfalls


# References

1. https://en.wikipedia.org/wiki/Select_%28Unix%29
2. https://en.wikipedia.org/wiki/Poll_(Unix)
3. https://en.wikipedia.org/wiki/Interrupt
4. https://en.wikipedia.org/wiki/File_descriptor
5. https://en.wikipedia.org/wiki/Inode
6. https://medium.com/@copyconstruct/nonblocking-i-o-99948ad7c957
7. https://medium.com/@copyconstruct/the-method-to-epolls-madness-d9d2d6378642
8. https://idea.popcount.org/2017-02-20-epoll-is-fundamentally-broken-12/
9. https://idea.popcount.org/2017-03-20-epoll-is-fundamentally-broken-22/
10. https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/
11. https://kovyrin.net/2006/04/13/epoll-asynchronous-network-programming/
12. http://man7.org/training/download/lusp_fileio_slides.pdf
13. https://www.youtube.com/watch?v=l6XQUciI-Sc
14. https://lwn.net/Articles/13587/
