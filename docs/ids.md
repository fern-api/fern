# IDs

An ID is a unique identifier and has a default type of a string. You can define the type of an ID, such as `ActorId` in this example:

```yaml
ids:
  - MovieId
  - name: ActorId
    type: integer
```

## Key benefit of IDs

Without IDs, developers can accidentally send a string/number of the wrong ID to an endpoint and the compiler doesn't know the difference. This can lead to bugs in production.

With branded types `MovieId` is defined as:

```typescript
export type MovieId = string & { __MovieId: void };
```

so you can't pass a string (or another ID, like `ActorId`) to endpoints that expect a `MovieId`.
