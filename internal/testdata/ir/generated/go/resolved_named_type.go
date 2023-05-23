package ir

type ResolvedNamedType struct {
	Name  *DeclaredTypeName `json:"name"`
	Shape ShapeType         `json:"shape"`
}
