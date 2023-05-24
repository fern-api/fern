# Design

The following describes a variety of design considerations for the
Go model generator.

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
