---
layout: ../../layouts/blog.astro
title: 'Node.js Wayfinder'
pubDate: 2025-06-12
description: 'Wayfinder point for all Node.js exploration topics'
author: 'Mikey Sleevi'
image:
    url: 'https://docs.astro.build/assets/rose.webp'
    alt: 'The Astro logo on a dark background with a pink glow.'
tags: ["compilers", "garbage-collection", "nodejs", "wayfinder"]
---
# Node.js Wayfinder

> Wayfinding encompasses all of the ways in which people orient themselves in physical space and navigate from place to place.[1]([https://en.wikipedia.org/wiki/Wayfinding](https://en.wikipedia.org/wiki/Wayfinding))

Welcome to the first wayfinder in the Zealot Chronicles! Wayfinders are a means of identifying important pieces of a given topic, they will provide a brief summary in addition to links to the various posts that are related to the topic at hand. This wayfinder is concerned with the runtime known as Node.js. 

Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. Although, it is not exclusively limited to the V8 engine, there are several additional engines in the JavaScript runtime space. The vast majority of applications utilize the V8 engine for their runtime, so the current posts contain information for V8 exclusively. This may be expanded in the future to include runtimes like  ChakraCore [2]([https://github.com/nodejs/node-chakracore](https://github.com/nodejs/node-chakracore)) and SpiderNode [3]([https://github.com/mozilla/spidernode](https://github.com/mozilla/spidernode)). In addition, the following posts focus exclusively on Linux and related systems. There are some correlations that can be drawn to other types of *nix systems. Furthermore, some articles will explore BSD alternatives and will discuss some of the benefits and drawbacks that exist on those systems. That withstanding, the primary focus will be on Linux systems.

The information contained in this posts are not intended for developers who are new to the field or as an introduction to server side javascript programming. These posts dive very deep on Node.js and the V8 runtime, exploring topics like the following:

- Compiler Optimizations
- Monomorphism, Polymorphism and Megamorphism
- Garbage Collection and Memory Management
- Assembly (x86)
- Bytecode (V8)
- Signal Handling
- Parsers and Tokenization
- Control Flow Graphs
- etc.

These posts are intended for the seasoned developer who wishes to dive deeper into something they already understand. Below is a list of posts associated with the topics above it will be beneficial to approach them in order, happy wayfinding!

- [How epoll Works]()
- [How Libuv Works]()
- [How V8 Works]()
- [How Orinco Work]()
- [How Node.js Works]()

References:

1. Wayfinding. [https://en.wikipedia.org/wiki/Wayfinding](https://en.wikipedia.org/wiki/Wayfinding)
2. ChakraCore. [https://github.com/nodejs/node-chakracore](https://github.com/nodejs/node-chakracore)
3. SpiderNode. [https://github.com/mozilla/spidernode](https://github.com/mozilla/spidernode)
