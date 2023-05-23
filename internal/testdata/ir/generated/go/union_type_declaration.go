package ir

type UnionTypeDeclaration struct {
	Discriminant   *NameAndWireValue   `json:"discriminant"`
	Extends        []*DeclaredTypeName `json:"extends"`
	Types          []*SingleUnionType  `json:"types"`
	BaseProperties []*ObjectProperty   `json:"baseProperties"`
}
