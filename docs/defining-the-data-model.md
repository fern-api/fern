# Defining the data model

## Defining Types

With Fern, there are four ways to define a type:

- [Objects](#objects)
- [Unions](#objects)
- [Aliases](#aliases)
- [Enums](#enums)

### Objects

Objects have named properties.

```yaml
types:
  Dog:
    properties:
      name: string
      likesToBark: boolean
```

Each property can reference an existing type, or a built-in [primitive](#primitives).

**Code**

In TypeScript, this might look something like:

```ts
interface Dog {
  name: string;
  likesToBark: boolean;
}
```

### Unions

A union type represents a value that can have one of several different types.

```yaml
types:
  Shape:
    union:
      square: Square
      circle: Circle
    docs: A shape is either a square or a circle. Don't ask about triangles.
  Square:
    properties:
      sideLength: double
  Circle:
    properties:
      radius: double
```

**Code**

In TypeScript, this might look something like:

```ts
/**
 * A shape is either a square or a circle. Don't ask about triangles.
 */
type Shape = Square | Circle;

interface Square {
  _type: "square";
  sideLength: number;
}

interface Circle {
  _type: "circle";
  radius: number;
}
```

#### Using `void`

In union types, you can use `void` when a member has no additional data.

```yaml
types:
  TaskResult:
    union:
      success: void
      failure: FailureDetails
  FailureDetails:
    properties:
      reason: string
```

**Code**

In TypeScript, this might look something like:

```ts
type TaskResult = Success | Failure;

interface Success {
  _type: "success";
}

interface Failure {
  _type: "failure";
  reason: string;
}
```

### Aliases

An alias type is simply a renaming of an existing type. This is often done to improve the clarity of the data model.

```yaml
types:
  DogName:
    alias: string
  Dog:
    properties:
      name: DogName
      friends: list<DogName>
```

You can also define an alias inline:

```diff diff-highlight
types:
- DogName:
-   alias: string
+ DogName: string
  Dog:
    properties:
      name: DogName
      friends: list<DogName>
```

**Code**

In TypeScript, this might look something like:

```ts
type DogName = string;

interface Dog {
  name: DogName;
  friends: DogName[];
}
```

### Enums

An enum type represents a collection of allowed values.

```ts
types:
  Suit:
    enum:
      - SPADES
      - HEARTS
      - CLUBS
      - DIAMONDS
```

**Code**

In TypeScript, this might look something like:

```ts
enum Suit {
  SPADES,
  HEARTS,
  CLUBS,
  DIAMONDS,
}
```

## Built-in types

Fern includes two kinds of built-in types: **primitives** and **containers**.

### Primitives

The includes primitives are:

- `string`
- `boolean`
- `integer`
- `double`
- `long`

### Containers

Containers wrap existing types. The included containers are

- `map<K, V>`
- `list<V>`
- `set<V>`
- `optional<V>`

```yml
types:
  KitchenSink:
    properties:
      someMap: map<string, boolean>
      myList: list<integer>
      maybeASet:
        docs: This might be missing!
        type: optional<set<string>>
```

**Code**

In TypeScript, this might look something like:

```ts
interface KitchenSink {
  someMap: Record<string, boolean>;
  myList: number[];
  /**
   * This might be missing!
   */
  maybeASet?: Set<string>;
}
```

## IDs

IDs are a common pattern in API development and are given a special place in a Fern Definition.

```
ids:
  - RepoId
types:
  Url: string
  GithubRepo:
    properties:
      id: RepoId
      name: string
      url: Url
```
