package types

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
