<!-- markdownlint-disable MD036 -->

# Defining a channel

Channels are used to send messages bidirectionally between a server and its clients. Currently, channels are implemented using WebSockets.

A channel consists of **messages**.

```yaml
ids:
  - UserId
types:
  ChatMessage:
    properties:
      from: UserId
      to: UserId
      content: string
channels:
  ChatsChannel:
    messages:
      sendChat:
        origin: client
        body:
          properties:
            to: UserId
            content: string
        behavior: request-response
      subscribeToNewChats:
        origin: client
        body: ChatMessage
        behavior: subscription
```

## Behaviors

Messages specify a `behavior`, which is either `subscription` or `request-response`.

### `request-response` behavior

With a `request-response` message, every request is expected to have an associated response. This is similar to a HTTP request.

**Code**

A TypeScript client might look something like this:

```ts
await chatsChannel.sendChat({ to, content });
```

### `subscription` behavior

With a `subscription` message, a request can have zero, one, or many responses over time.

**Code**

A TypeScript client might look something like this:

```ts
chatsChannel.subscribeToNewChats({
  onMessage: (newMessage) => {
    console.log(newMessage);
  },
});
```

## Errors

Every message can specify [errors](errors.md) - i.e. responses that indicate that something went wrong. The message's `errors` field must be a union.

```diff-yaml diff-highlight
 ids:
   - UserId
 types:
   ChatMessage:
     properties:
       from: UserId
       to: UserId
       content: string
 channels:
   ChatsChannel:
     messages:
       sendChat:
         origin: client
         body:
           properties:
             to: UserId
             content: string
         behavior: request-response
         response:
+          errors:
+            union:
+              invalidUserId: NotFoundError
+              contentTooLong: TooLargeError
       subscribeToNewChats:
         origin: client
         body: ChatMessage
         behavior: subscription
+errors:
+  NotFoundError:
+    http:
+      statusCode: 404
+  TooLargeError:
+    http:
+      statusCode: 413
```
