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

## Alias

A Fern alias is simply translated into a Go type alias, such that the types can be used
interchangeably. For example,

```yaml
types:
  String: string
  Foo:
    properties:
      name: String
```

```go
// string.go

type String = string
```

```go
// foo.go

type Foo struct {
	Name String `json:"name"`
}
```

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

Note that the generated visitor does _not_ include methods for the union's extended
and/or base properties because these values can always be set alongside the union
properties, where only one can be set. Put simply, the user of the union can access
the extended and/or base properties just like an ordinary object's properties.

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
  typeName         string
  Type             *Type
  String           string
  IntegerOptional  *int
  StringBooleanMap map[string]bool
  StringList       []string
  StringListList   [][]string
  DoubleSet        []float64
}
```

Note that the `typeName` discriminant is un-exported; it is only used to distinguish which
value is actually set so that the generated visitor and `json.Marshaler` implementation can
act accordingly. The user will not have access to this value because it's an undiscriminated
union.

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

## Literals

Fern supports literal values with the `<literal<>>` syntax. For now, the only
supported literals are string types, such as the following:

```yaml
types:
  Foo:
    properties:
      name: string
      value: literal<"fern">
```

In this case, the `value` property should only ever be set to the `"fern"` string.
Ideally, the user is not allowed to mutate this value at all.

Without literals, the generator represents custom types by simply including the
relevant JSON serde tags like so:

```go
type Foo struct {
  Name string `json:"name"`
}
```

However, if a literal is included (like the `value` property shown above), we can't
rely on simple serde tags because it would mean the value could be mutated and/or
modified on the wire. Thus, we un-export the field name, generate a getter method for
it, and generate custom [un]marshaling logic to handle this case:

```go
type Foo struct {
  Name  string `json:"name"`
  value string
}

func (f *Foo) Value() string {
  return f.value
}

func (f *Foo) UnmarshalJSON(data []byte) error {
  type unmarshaler Foo
  var value unmarshaler
  if err := json.Unmarshal(data, &value); err != nil {
    return err
  }
  *f = Foo(value)
  f.value = "fern"
  return nil
}

func (f *Foo) MarshalJSON() ([]byte, error) {
  type embed Foo
  var marshaler = struct {
    embed
    Value string `json:"value"`
  }{
    embed: embed(*f),
    Value: "fern",
  }
  return json.Marshal(marshaler)
}
```

The `UnmarshalJSON` and `MarshalJSON` implementations both take advantage of
a separate type declaration (i.e. `type unmarshaler Foo` in `UnmarshalJSON` and
`type embed Foo` in `MarshalJSON`).

This effectively provides the default JSON serde logic for the non-literal
fields in the `Foo` object, but allows us to _extend_ the serialization logic
without causing an infinite recursive loop (i.e. if we tried to call `json.Unmarshal`
on the same `Foo` type within its `UnmarshalJSON` method).

With this, the user cannot mutate the value of the `value` literal, it will _always_
be set to `"fern"` (as long as it's [de]serialized from JSON), and they can access it
with the idiomatic `Value()` getter.

## Client

Every one of the Fern services receives its own generated client interface, and they
are consolidated into a single `Client` type that the user can interact with.

### Options

There are a few different ways that endpoints can specify parameters, some of which
can coexist. In Go, positional parameters are ideally treated as _required_ parameters,
such that the user must provide a valid value in order to call the function. When
a parameter is optional, the idiomatic approach is to use functional options, like so:

```go
type RunOption func(*runOptions)

func WithDryRun() RunOption {
  return func(opts *runOptions) {
    opts.dryRun = true
  }
}

type Runner interface {
  Run(name string, opts ...RunOption) error
}

type runOptions struct {
  dryRun bool
}
```

In this case, the `Run` function _requires_ a `name`, but the user can optionally
set the `dryRun` option with the `WithDryRun` option.

With that said, we can generate more idiomatic method signatures if endpoint-specific
authorization or headers are specified.

For example, consider the following Fern definition:

```yaml
service:
  base-path: /users
  auth: false
  endpoints:
    getUser:
      auth: true
      method: GET
      path: /{userId}
      path-parameters:
        userId: string
      request:
        name: GetUserRequest
        query-parameters:
          shallow: optional<boolean>
      response: GetUserResponse
```

The generated client looks like the following:

```go
type GetUserRequest struct {
  Shallow *bool
}

type GetUserOption interface {
  // ...
}

func GetUserWithAuthorization(bearer string) GetUserOption {
  // ...
}

type UserClient interface {
  GetUser(ctx context.Context, userId string, request *GetUserRequest, opts ...GetUserOption) (*GetUserResponse, error)
}
```

With this, the user can call the API like so:

```go
func Run(ctx context.Context) error {
  client := NewUserClient(...)
  request := &GetUserRequest{
    Shallow: ptr.Bool(true),
  }
  response, err := client.GetUser(ctx, "user-123", request, GetUserWithAuthorization("<token>"))
  if err != nil {
    return err
  }
  // Use response ...
  return nil
}
```

#### Considerations

There's a few things about this API that need to be considered.

##### Optional Query Parameters

For `GET` endpoints, the `request` is not always required - it might just be a series of optional
query parameters that adapt the behavior of the endpoint (e.g. `limit`). In that case, the caller
always needs to specify a value for `GetUserRequest` which isn't ideal:

```go
_, err := client.GetUser(ctx, "user-123", nil)
if err := nil {
  return err
}
```

We _could_ include the request as another option, but it's a lot less discoverable if there are any
required parameters within the request (i.e. for both a body or a query parameter).

##### Client-Server Consistency

Functional options also end up creating an inconsistency on the server-side. If client-side call options
are later introduced that don't translate well to the server-side (e.g. a retry backoff policy), then it
doesn't make sense to provide the same option type on the server API. But if we support custom headers
via a functional option, then how does the server access these headers?

One option is to support separate types for client-side and server-side options (e.g. `GetUserCallOption`
and `GetUserHandlerOption`), but this could get fairly bloated. Alternatively, we use a context-based
approach to set and retrieve headers, and drop the functional option altogether.

```go
func GetUserWithFooHeader(ctx context.Context, foo string) context.Context {
  // Set the header on the context.
}
```

But this is a lot less discoverable because the context-based option isn't suggested by the generated
function signature at all - the user needs to know that it exists and mutate the `context.Context`
before issuing the call.

##### Fern Generator Consistency

Other Fern generators (e.g. Java and Typescript) include _all_ of the `request` fields (including headers)
in the endpoint's request. For consistency, we could do the same thing here, but we still need to fit
authorization and custom headers in alongside the `request`.
