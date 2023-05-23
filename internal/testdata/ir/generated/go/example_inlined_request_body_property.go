package ir

type ExampleInlinedRequestBodyProperty struct {
	WireKey                 string                `json:"wireKey"`
	Value                   *ExampleTypeReference `json:"value"`
	OriginalTypeDeclaration *DeclaredTypeName     `json:"originalTypeDeclaration"`
}
