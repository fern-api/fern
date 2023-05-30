package ir

type ExampleInlinedRequestBodyProperty struct {
	WireKey string                `json:"wireKey"`
	Value   *ExampleTypeReference `json:"value"`
	// this property may have been brought in via extension. originalTypeDeclaration
	// is the name of the type that contains this property
	OriginalTypeDeclaration *DeclaredTypeName `json:"originalTypeDeclaration"`
}
