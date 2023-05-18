# Design

The following describes a variety of design considerations for the
Go model generator.

## Unions

Unions are represented as an `interface`, where every type included
in the union is a `struct` that implements that `interface`. This
lets users use an idiomatic type assertion to act upon the value
that's set, like so:

```go
// Foo is a standard type with a single union property.
type Foo struct {
  Bar Bar
}

// Bar is a union property, implemented by every struct that
// begins with the 'Bar' prefix.
type Bar interface {
  isBar()
}

// BarBaz implements the Bar interface.
type BarBaz struct {
  Type string
}

// BarQux implements the Bar interface.
type BarQux struct {
  Type string
}

func Run(foo *Foo) {
  switch foo.Bar.(type) {
  case *BarBaz:
    // Do something with BarBaz.
  case *BarQux:
    // Do something with BarQux.
  }
  ...
}
```

### Visitors

To ensure compile-time checks (as discussed below), every union has
a visitor that can be used to visit its fields. Given that we're
modeling unions as interfaces (which is idiomatic to Go), this means
that the visitor must be implemented on the type the contains the
union, and not on the union itself (i.e. interfaces can't implement
methods).

Note that if this ends up not being desirable, we can instead model
unions as a `struct` with a field reserved for every possible value
of the union (but this is not idiomatic).

The current API is demonstrated in `internal/types/types_test.go`, but
it's subject to change based on the overall union design.

An example snippet is shown below:

```go
package example

// visitor visits types associated with the TypeReference union.
type visitor struct {}

func (v *visitor) VisitTypeReferenceNamed(_ *TypeReferenceNamed) error { return nil }
func (v *visitor) VisitTypeReferenceContainer(_ *TypeReferenceContainer) error { return nil }
func (v *visitor) VisitTypeReferencePrimitive(_ *TypeReferencePrimitive) error { return nil }
func (v *visitor) VisitTypeReferenceUnknown(_ *TypeReferenceUnknown) error { return nil }

// ObjectProperty is a single property associated with an object.
type ObjectProperty struct {
  Docs         string            `json:"docs,omitempty"`
  Availability *Availability     `json:"availability,omitempty"`
  Name         *NameAndWireValue `json:"name,omitempty"`
  ValueType    TypeReference     `json:"valueType,omitempty"`
}

func Run() error {
  primitive := &ObjectProperty{
    Docs: "union",
    Availability: &Availability{
      Status:  AvailabilityStatusInDevelopment,
      Message: "in-development",
    },
    ValueType: &TypeReferencePrimitive{
      Type:      "string",
      Primitive: PrimitiveTypeString,
    },
  }
  visitor := new(visitor)
  if err := primitive.VisitValueType(visitor); err != nil {
    return err
  }
  // ...
}
```

Also note that we may want to consider changing the `Visit*` methods to be based on
the name of the union key, and not the type, e.g.:

```yaml
container:
  type: ContainerType
  key: container
named: ResolvedNamedType
```

```go
type TypeReferenceVisitor interface {
  VisitContainer(*types.ContainerType)
  VisitNamed(types.ResolvedNamedType)
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

## Compile-time Checks

We need to include some sort of compile-time check that users can opt-in
to so that they can recognize whether or not they're handling all of
the types in a union.

For example, consider the case when a new type (e.g. `Blue`) is introduced
to a `Color` union. It's impossible for the program to have handled this case
before the generator is run to include the new color, but in the traditional
case this will only be recognized at runtime:

```go
func Run(color Color) {
  switch color.(type) {
  case *Red:
    // ...
  case *Yellow:
    // ...
  }
  ...
}
```

In this case, the `Color` will continue to work just fine, but `*Blue` isn't
explicitly handled by the user's implementation.

We might be able to take inspiration from the gRPC+Protobuf approach to ensure
that a server implements all the endpoints specified by the API (which is an
opt-in model).

Alternatively, there is the concept of a "sealed interface", which requires that
the user takes advantage of an interface to interact with all the union types.
For example,

```go
type ColorVisitor interface {
  VisitRed(*Red)
  VisitYellow(*Yellow)
  VisitBlue(*Blue)
}
```

In this case, if the user is expected to implement the interface in order to
interact with the union, then they will initially have a compile-time error
because their implemnentation will not have implemented `VisitBlue` before the
new code was generated.
