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
