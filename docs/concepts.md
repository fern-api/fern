# Model

The _Fern model_ describes the data model used to defining your APIs in Fern. A _Fern model_ is used to describe a service and data structure.

A _Fern model_ is made up of `types` which come in three kinds: built-in, aggregate, and service.

-   _Built-in type_ - primitive values such as 'integer' and 'string'
-   _Aggregate type_ - contain members such as 'list of strings' or an 'Address' structure
-   _Service type_ - specific semantics that define a service

## Primitives

-   _Imports_ - reference other Fern YML files in your repo.
-   _Ids_ - named identifiers; defaults to _string_
-   _Types_
    -   _Query parameters_ - e.g. `https://example.com/api/dog?breed=corgi&age=3`
    -   _Parameters_ - parsed sections of URLs e.g. `https://example.com/dog/{breed}/{age}/`
    -   _Properties_ - types that define an object
-   Services - HTTP Endpoints that support HTTP methods including `GET`, `PUT`, `POST`, `DELETE`
-   Errors - Named and structured errors

## Type definitions

-   _docs_ - a string for documentation
-   _extends_ - inherit the types from another Fern model
    -   _properties_ - defines the types that comprise an object
        -   _name_ - a named type
        -   _shape_ - ?
        -   _fernFilepath_ - a filepath to a Fern model, excluding the file extension

## Named types

Users may define the following kinds of named types. These can be referenced by their name elsewhere in a Fern definition.

-   _Object_ - a collection of named properties
-   _Union_ - differently named variants, each of which can be different types -_Container_ - -_primitive_ - ? (built-in types)
    _void_ - ?
-   _Enum_ - named string variants, e.g. "CORGI", "POODLE", "BULLDOG"
-   _Alias_ - a new name for an existing type; used to make the types more self-documenting

## Container types

-   `list<T>` - an ordered sequence of items of type `T`.
-   `map<K, V>` - values of type `V` each indexed by a unique key of type `K` (keys are unordered).
-   `optional<T>` - represents a value of type `T` which is either present or not present.
-   `set<T>` - a collection of distinct values of type `T`.

## Built-in types

-   `any` - a catch-all type
-   `boolean`
-   `number` ?
-   `integer`
-   `double`
-   `integer` - a signed 32-bit integer value
-   `string`

## Futher reading

To see the YML representation of these types, see the [Type definitions](fern/packages/api/src/types.yml).
