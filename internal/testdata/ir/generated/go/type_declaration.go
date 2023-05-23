package ir

type TypeDeclaration struct {
	Docs            *string             `json:"docs"`
	Availability    *Availability       `json:"availability"`
	Name            *DeclaredTypeName   `json:"name"`
	Shape           *Type               `json:"shape"`
	Examples        []*ExampleType      `json:"examples"`
	ReferencedTypes []*DeclaredTypeName `json:"referencedTypes"`
}
