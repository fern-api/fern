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

Right now, enums are represented with pointer values so that we
can customize how they're unmarshaled via `json.Unmarshaler`. This
is necessary so that the enum can be represented as a string on the
wire, but represented idiomatically in Go (as a `uint`).

Ideally, we'd be able to represent the enum as a non-pointer value,
so there might be something better we can do here.

For example,

```go
// Enum defines an enum
type Enum uint8

// All of the supported Enum values.
const (
	EnumOne Enum = iota + 1
	EnumTwo
)

// String implements fmt.Stringer.
func (e *Enum) String() string {
	if e == nil {
		return ""
	}
	switch *e {
	case EnumOne:
		return "ONE"
	case EnumTwo:
		return "TWO"
	default:
		return strconv.Itoa(int(*e))
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
		e = &value
	case "TWO":
		value := EnumTwo
		e = &value
	}
	return nil
}
```
