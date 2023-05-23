package ir

type ObjectTypeDeclaration struct {
	Extends    []*DeclaredTypeName `json:"extends"`
	Properties []*ObjectProperty   `json:"properties"`
}
