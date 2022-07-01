# Types

With Fern, you can make your own types! There are four ways to define a type:

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

**Equivalent code**

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

**Equivalent code**

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

**Equivalent code**

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

### Enums

An enum type represents a collection of allowed values.

```yaml
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

### Aliases

An alias type renames an existing type. Use aliases to remove ambiguity. For example, without aliases:

```yaml
types:
  Employee:
    id: string
    name: string
    # hmm, is this the manager's name or ID?
    manager: string
```

With aliases:

```diff-yaml diff-highlight
types:
+ EmployeeId: string
  Employee:
+   id: EmployeeId
    name: string
+   manager: EmployeeId
```

**Equivalent code**

In TypeScript, this might look something like:

```ts
type EmployeeId = string;

interface Employee {
  id: EmployeeId;
  name: string;
  manager: EmployeeId;
}
```

## Built-in types

Fern includes two kinds of built-in types: **primitives** and **containers**.

### Primitives

The includes primitives are:

- `integer`
- `double`
- `long` _(range -2^53 to 2^53)_
- `string`
- `boolean`
- `date_time`
- `UUID`

### Containers

Containers wrap existing types. The included containers are

- `map<K, V>`
- `list<V>`
- `set<V>`
- `optional<V>`

```yml
types:
  KitchenSink:
    docs: Quite the kitchen sink!
    properties:
      someMap: map<string, boolean>
      myList: list<integer>
      maybeASet: optional<set<string>>
```

**Equivalent code**

In TypeScript, this might look something like:

```ts
/**
 * Quite the kitchen sink!
 */
interface KitchenSink {
  someMap: Record<string, boolean>;
  myList: number[];
  maybeASet?: Set<string>;
}
```

## IDs

IDs are a common pattern in API development and are given a special place in a Fern API Definition.

```yaml
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
