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
