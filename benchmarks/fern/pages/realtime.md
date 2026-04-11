---
title: Realtime Events
slug: realtime
description: Subscribe to live updates using Server-Sent Events and WebSockets.
---

# Realtime Events

The Acme API supports realtime event streaming so your application can react to changes as they happen, without polling.

## Server-Sent Events (SSE)

SSE provides a simple, one-directional stream of events over HTTP. This is the recommended approach for most use cases.

### Connecting

```bash
curl -N https://api.acme.com/v1/events/stream \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: text/event-stream"
```

### Event Format

```
event: order.created
data: {"id": "order_abc", "amount": 5000, "currency": "usd"}
id: evt_123
retry: 3000

event: order.updated
data: {"id": "order_abc", "status": "processing"}
id: evt_124
retry: 3000
```

### Filtering Events

Subscribe to specific event types using query parameters:

```bash
curl -N "https://api.acme.com/v1/events/stream?types=order.created,order.completed" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: text/event-stream"
```

### Resuming After Disconnect

Pass the `Last-Event-ID` header to resume from where you left off. The server replays any events that occurred while you were disconnected.

```bash
curl -N https://api.acme.com/v1/events/stream \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: text/event-stream" \
  -H "Last-Event-ID: evt_123"
```

## WebSocket API

For bidirectional communication, use the WebSocket endpoint.

### Connecting

```javascript
const ws = new WebSocket("wss://ws.acme.com/v1/stream");

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: "auth",
    api_key: "YOUR_API_KEY"
  }));

  // Subscribe to channels
  ws.send(JSON.stringify({
    type: "subscribe",
    channels: ["orders", "inventory"]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Received: ${data.type}`, data.payload);
};
```

### Heartbeat

The server sends a `ping` message every 30 seconds. Your client should respond with `pong` to keep the connection alive. Connections that miss 3 consecutive pings are automatically closed.

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "ping") {
    ws.send(JSON.stringify({ type: "pong" }));
    return;
  }
  // Handle other events...
};
```

## SDK Support

```python
import acme

client = acme.Client(api_key="YOUR_API_KEY")

# SSE streaming
for event in client.events.stream(types=["order.created"]):
    print(f"New order: {event.data.id}")

# With automatic reconnection
for event in client.events.stream(
    types=["order.created"],
    auto_reconnect=True,
    max_retries=10
):
    process_event(event)
```

## Connection Limits

| Plan | SSE Connections | WebSocket Connections |
|------|----------------|----------------------|
| Starter | 5 | 2 |
| Growth | 25 | 10 |
| Enterprise | 100 | 50 |

Exceeding the connection limit returns a `429 Too Many Connections` error.
