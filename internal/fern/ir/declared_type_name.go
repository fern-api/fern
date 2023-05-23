package ir

type DeclaredTypeName struct {
	TypeId       TypeId        `json:"typeId"`
	FernFilepath *FernFilepath `json:"fernFilepath"`
	Name         *Name         `json:"name"`
}
