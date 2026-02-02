---
layout: ../../layouts/blog.astro
title: "Microservices Communication Patterns"
pubDate: 2026-01-24
shortDescription: "Exploring synchronous and asynchronous communication in distributed systems"
description: "This article examines various communication patterns for microservices architectures including REST, gRPC, message queues, and event-driven approaches. Learn when to use each pattern and the trade-offs involved."
author: "Mikey Sleevi"
tags: ["microservices", "system-design", "api-design", "distributed-systems"]
---

# Microservices Communication Patterns

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet.

## Synchronous Communication

Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus.

### REST APIs

Tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel.

```javascript
// Express REST endpoint
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### gRPC

Luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus.

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

## Asynchronous Communication

Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.

### Message Queues

Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc. Aenean massa.

```python
# RabbitMQ producer
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()
channel.queue_declare(queue='orders')

channel.basic_publish(
    exchange='',
    routing_key='orders',
    body=json.dumps({'order_id': '12345', 'item': 'widget'})
)
```

### Event-Driven Architecture

Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec.

```python
# Kafka consumer
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    'order-events',
    bootstrap_servers=['localhost:9092'],
    group_id='order-processor'
)

for message in consumer:
    event = json.loads(message.value)
    process_order_event(event)
```

## Service Discovery

Pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec.

### Client-Side Discovery

Vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede.

### Server-Side Discovery

Mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.

## Circuit Breaker Pattern

Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis.

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 30000) {
    this.failures = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED';
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        setTimeout(() => this.state = 'HALF-OPEN', this.timeout);
      }
      throw error;
    }
  }
}
```

## Saga Pattern

Feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet.

### Choreography

Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui.

### Orchestration

Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.

## Conclusion

Sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.

References:

1. Building Microservices. Sam Newman.
2. Microservices Patterns. Chris Richardson.
