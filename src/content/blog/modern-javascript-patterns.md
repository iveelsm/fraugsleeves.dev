---
layout: ../../layouts/blog.astro
title: "Modern JavaScript Patterns"
pubDate: 2026-01-22
shortDescription: "Exploring contemporary JavaScript design patterns and best practices"
description: "A deep dive into modern JavaScript patterns including modules, closures, async patterns, and functional programming concepts. This article provides practical examples and explanations for writing maintainable JavaScript code."
author: "Mikey Sleevi"
tags: ["javascript", "web-development", "design-patterns", "best-practice"]
---

# Modern JavaScript Patterns

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit.

## The Module Pattern

Maecenas sed diam eget risus varius blandit sit amet non magna. Sed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla.

```javascript
const UserModule = (function() {
  let privateData = [];
  
  function privateMethod() {
    return privateData.length;
  }
  
  return {
    addUser: function(user) {
      privateData.push(user);
    },
    getCount: function() {
      return privateMethod();
    }
  };
})();
```

Vestibulum id ligula porta felis euismod semper. Cras mattis consectetur purus sit amet fermentum.

## Closures and Scope

Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.

### Practical Closure Examples

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}
```

## Async/Await Patterns

Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec sed odio dui. Nullam quis risus eget urna mollis ornare vel eu leo.

### Error Handling

Etiam porta sem malesuada magna mollis euismod. Maecenas faucibus mollis interdum. Duis mollis, est non commodo luctus.

```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}
```

## Functional Programming Concepts

Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Cras mattis consectetur purus sit amet fermentum.

### Pure Functions

Nulla vitae elit libero, a pharetra augue. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

```javascript
// Pure function
const add = (a, b) => a + b;

// Impure function (has side effects)
let total = 0;
const addToTotal = (value) => total += value;
```

### Composition

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec id elit non mi porta gravida at eget metus.

```javascript
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const addOne = x => x + 1;
const double = x => x * 2;

const addOneThenDouble = compose(double, addOne);
console.log(addOneThenDouble(5)); // 12
```

## Observer Pattern

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Aenean eu leo quam.

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}
```

## Conclusion

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Maecenas sed diam eget risus varius blandit sit amet non magna.

References:

1. JavaScript Patterns. Stoyan Stefanov.
2. You Don't Know JS. Kyle Simpson.
