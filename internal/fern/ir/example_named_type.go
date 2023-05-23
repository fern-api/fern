package ir

type ExampleNamedType struct {
	TypeName *DeclaredTypeName `json:"typeName"`
	Shape    *ExampleTypeShape `json:"shape"`
}
