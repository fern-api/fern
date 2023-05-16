package types

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
)

// AuthRequirement defines an auth requirement.
type AuthRequirement uint8

// All of the support auth requirements.
const (
	AuthRequirementAll AuthRequirement = iota + 1
	AuthRequirementAny
)

// String implements fmt.Stringer.
func (a AuthRequirement) String() string {
	switch a {
	case AuthRequirementAll:
		return "ALL"
	case AuthRequirementAny:
		return "ANY"
	default:
		return strconv.Itoa(int(a))
	}
}

// APIAuth represents the API auth configuration.
type APIAuth struct {
	Docs        string           `json:"docs,omitempty"`
	Requirement *AuthRequirement `json:"requirement,omitempty"`
	Schemes     []AuthScheme     `json:"schemes,omitempty"`
}

// AuthScheme represents a union of auth schemes.
type AuthScheme interface {
	isAuthScheme()
}

// AuthSchemeBearer is the bearer AuthScheme.
type AuthSchemeBearer struct {
	Type  string `json:"_type,omitempty"`
	Docs  string `json:"docs,omitempty"`
	Token *Name  `json:"token,omitempty"`
}

func (*AuthSchemeBearer) isAuthScheme() {}

// AuthSchemeBasic is the basic AuthScheme.
type AuthSchemeBasic struct {
	Type     string `json:"_type,omitempty"`
	Docs     string `json:"docs,omitempty"`
	Username *Name  `json:"username,omitempty"`
	Password *Name  `json:"password,omitempty"`
}

func (*AuthSchemeBasic) isAuthScheme() {}

// AuthSchemeHeader is the header AuthScheme.
type AuthSchemeHeader struct {
	Type             string            `json:"_type,omitempty"`
	Docs             string            `json:"docs,omitempty"`
	NameAndWireValue *NameAndWireValue `json:"nameAndWireValue,omitempty"`

	// TODO: Add the rest of the valid TypeReferences (only primitive is supported so far).
	ValueType TypeReference `json:"valueType,omitempty"`
	Prefix    string        `json:"prefix,omitempty"`
}

func (*AuthSchemeHeader) isAuthScheme() {}

// TypeReference is a reference to a generic type (e.g. primitives,
// containers, etc).
type TypeReference interface {
	isTypeReference()
}

// TypeReferencePrimitive is the primitive TypeReference.
type TypeReferencePrimitive struct {
	Type      string        `json:"_type,omitempty"`
	Primitive PrimitiveType `json:"primitive,omitempty"`
}

// AuthRequirement defines a primitive type.
type PrimitiveType uint8

// All of the support auth requirements.
const (
	PrimitiveTypeInteger PrimitiveType = iota + 1
	PrimitiveTypeDouble
	PrimitiveTypeString
	PrimitiveTypeBoolean
	PrimitiveTypeLong
	PrimitiveTypeDateTime
	PrimitiveTypeDate
	PrimitiveTypeUUID
	PrimitiveTypeBase64
)

// String implements fmt.Stringer.
func (p PrimitiveType) String() string {
	switch p {
	case PrimitiveTypeInteger:
		return "INTEGER"
	case PrimitiveTypeDouble:
		return "DOUBLE"
	case PrimitiveTypeString:
		return "STRING"
	case PrimitiveTypeBoolean:
		return "BOOLEAN"
	case PrimitiveTypeLong:
		return "LONG"
	case PrimitiveTypeDateTime:
		return "DATE_TIME"
	case PrimitiveTypeDate:
		return "DATE"
	case PrimitiveTypeUUID:
		return "UUID"
	case PrimitiveTypeBase64:
		return "BASE_64"
	default:
		return strconv.Itoa(int(p))
	}
}

// Name contains a variety of different naming conventions for
// a given identifier.
type Name struct {
	OriginalName       string          `json:"originalName,omitempty"`
	CamelCase          *SafeUnsafeName `json:"camelCase,omitempty"`
	SnakeCase          *SafeUnsafeName `json:"snakeCase,omitempty"`
	ScreamingSnakeCase *SafeUnsafeName `json:"screamingSnakeCase,omitempty"`
	PascalCase         *SafeUnsafeName `json:"pascalCase,omitempty"`
}

// SafeUnsafeName contains both the unsafe and safe name representation
// for a given identifier.
type SafeUnsafeName struct {
	SafeName   string `json:"safeName,omitempty"`
	UnsafeName string `json:"unsafeName,omitempty"`
}

// NameAndWireValue contains both the name and the wire value representation
// for a given identifier.
type NameAndWireValue struct {
	Name      *Name  `json:"name,omitempty"`
	WireValue string `json:"wireValue,omitempty"`
}

// IntermediateRepresentation is the input used in a Fern generator.
// This is generated from the Fern compiler and fed into each of the
// configured generators during the code generation process.
type IntermediateRepresentation struct {
	APIName        *Name    `json:"apiName,omitempty"`
	APIDisplayName string   `json:"apiDisplayName,omitempty"`
	APIDocs        string   `json:"apiDocs,omitempty"`
	Auth           *APIAuth `json:"auth,omitempty"`

	// Headers []string `json:"headers,omitempty"`
	// Types map[string]string `json:"types,omitempty"`
	// Services map[string]string `json:"services,omitempty"`
	// Errors map[string]string `json:"errors,omitempty"`
	// Subpackages map[string]string `json:"subpackages,omitempty"`
	// RootPackage string `json:"rootPackage,omitempty"`
	// Constants []string `json:"constants,omitempty"`
	// Environments []string `json:"environments,omitempty"`
	// BasePath string `json:"basePath,omitempty"`
	// PathParameters string `json:"pathParameters,omitempty"`
	// ErrorDiscriminationStrategy string `json:"errorDiscriminationStrategy,omitempty"`
	// SDKConfig string `json:"sdkConfig,omitempty"`
	// Variables string `json:"variables,omitempty"`
}

// ReadIR reads the *InermediateRepresentation from the given filename.
func ReadIR(irFilename string) (*IntermediateRepresentation, error) {
	bytes, err := os.ReadFile(irFilename)
	if err != nil {
		return nil, fmt.Errorf("failed to read intermediate representation: %v", err)
	}
	ir := new(IntermediateRepresentation)
	if err := json.Unmarshal(bytes, ir); err != nil {
		return nil, fmt.Errorf("failed to unmarshal intermediate representation: %v", err)
	}
	return ir, nil
}
