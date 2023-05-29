# Design

The following describes a variety of design considerations for the
Go model generator.

## Import Paths

Unlike other languages, Go _requires_ a somewhat absolute import path.
To be clear, import statements like `../../api` are not allowed. This
ends up creating a common challenge for Go code generators - the implementation
must know where to base the relative import paths from.

The base import path is configured in the `go.mod` file, which acts like
`package.json` (it's the "root" of the module), like so:

```
module github.com/fern-api/fern-go

go 1.19
```

With this `module` statement, all of the Go packages defined within the module
are imported with that prefix like so:

```go
package example

import "github.com/fern-api/fern-go/internal/generator"

func Run() error {
  g, err := generator.New(nil)
  if err != nil {
    return err
  }
  // ...
}
```

When Fern is configured to generate code locally, it can write its output anywhere
on the local filesystem. It's common (and expected) for users to write something
along the lines of the following:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-go-model
        version: latest
        output:
          location: local-file-system
          path: ../../generated/go
```

This presents a challenge - how does the generator know how to stich together the
configured Go `module` path, and Fern's relative output location? There are ways
to programmatically resolve the `module` path within the generator (at runtime),
but it's not always a reliable identifier (the user might write the generated
output to a separate location altogether).

Instead, a somewhat clunky, yet simple, solution is to require the user to explicitly
specify the import path whenever they have Fern definitions that require cross-package
imports like so:

```yaml
default-group: local
groups:
  local:
    generators:
      - name: fernapi/fern-go-model
        version: latest
        config:
          importPath: github.com/fern-api/fern-go/internal/testdata/packages/generated/go
        output:
          location: local-file-system
          path: ../../generated/go
```

For SDKs consumed from a GitHub repository, the solution is a little simpler. The
import path is simply the same name as the GitHub repository because all of the code
exists under that namespace, starting from the root of the repository. For example,

```yaml
default-group: github
groups:
  github:
    generators:
      - name: fernapi/fern-go-model
        version: latest
        config:
          importPath: github.com/stripe-api/stripe-go
        output:
          ...
```

Note that a `config.importPath` setting is _not_ required if the user does not require
any cross-package imports.

## Unions

Unions are represented as a `struct`, where exactly one of its fields
is non-empty.

```go
type Union struct {
  Type string
  Foo *Foo
  Bar *Bar
}

type Foo struct {
  ID string
}

type Bar struct {
  ID string
}
```

A visitor is generated for every union so that it's easier to access
the non-empty attribute (i.e. without a series of `if` conditions
checking for existence). Plus, this gives users a compile-time assertion
that they've recognized all of the values that can be represented by
the given union. For example,

```go
type UnionVisitor interface {
  VisitFoo(*Foo) error
  VisitBar(*Bar) error
}

func (u *Union) Accept(v UnionVisitor) error {
  switch u.Type {
  case "foo":
    return v.VisitFoo(u.Foo)
  case "bar":
    return v.VisitBar(u.Bar)
  default:
    return fmt.Errorf("invalid type %s in %T", u.Type, u)
  }
}
```

With this, users can implement the visitor interface and interact
with the generated union type like so:

```go
type unionVisitor struct {
  // ...
}

func (u *unionVisitor) VisitFoo(foo *Foo) error {
  // Do something with *Foo ...
}

func (u *unionVisitor) VisitBar(bar *Bar) error {
  // Do something with *Bar ...
}

func Run(u *Union) error {
  visitor := new(unionVisitor)
  if err := u.Accept(visitor); err != nil {
    return err
  }
  // ...
}
```

## Undiscriminated Unions

Fern supports undiscriminated unions, which function exactly how it sounds - the
wire representation is simply the underlying JSON object, with nothing signifying
what is encoded. However, we still want to reprsent these types like standard unions,
so that users can explore the union type with the `Visitor` pattern, and can clearly
understand what type they are interacting with.

However, given that undiscriminated unions are specified as a simple list, the Go
generator has to come up with its own naming convention to handle cases for the
primitive and built-in types.

For example, consider the following Fern definition:

```yaml
types:
  Union:
    discriminated: false
    union:
      - Type
      - string
      - optional<integer>
      - map<string, boolean>
      - list<string>
      - list<list<string>>
      - set<double>
  Type:
    properties:
      id: string
```

For custom types, the naming convention just uses the same name as the type (i.e. `Type`
is recognized with a field name of `Type`). But what do we do for the built-in types like
`list<string>`?

In these cases, we generate a name based on the underlying type. For the `list` type we
use the `List` suffix, the `map` type a `Map` suffix, and so on. The generated code looks
like the following:

```go
package api

type Union struct {
  Type             *Type
  String           string
  IntegerOptional  *int
  StringBooleanMap map[string]bool
  StringList       []string
  StringListList   [][]string
  DoubleSet        []float64
}
```

## Enums

Enums implement `json.Unmarshaler` with a pointer receiver (unlike
their other methods, e.g. `fmt.Stringer`). This is necessary so that
the enum can be represented as a string on the wire, but represented
idiomatically in Go (as a `uint`).

For example,

```go
// Enum defines an enum.
type Enum uint8

// All of the supported Enum values.
const (
	EnumOne Enum = iota + 1
	EnumTwo
)

// String implements fmt.Stringer.
func (e Enum) String() string {
	switch e {
	case EnumOne:
		return "ONE"
	case EnumTwo:
		return "TWO"
	default:
		return strconv.Itoa(int(e))
	}
}

// UnmarshalJSON implements json.Unmarshaler.
func (e *Enum) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "ONE":
		value := EnumOne
		*e = value
	case "TWO":
		value := EnumTwo
		*e = value
	}
	return nil
}
```

## Sets

Fern supports the `set` type in a variety of ways (depending on the target
language). In languages like Java, it's easy to specify a set of custom
types (e.g. `Set<Movie>`). In Go, it's not so easy - a `map[<type>]struct{}`
is the idiomatic way to represent a set of `<type>`, but using a pointer `<type>`
often ends up with a confusing user experience because the same pointer must
be used to check for existence (not just the values set in the pointer).

For now, the Go generator represents the `set` type just like the `list`.
Note that we might revisit this later.
