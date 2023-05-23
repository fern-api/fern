package ir

type VariableDeclaration struct {
	Docs *string        `json:"docs"`
	Id   VariableId     `json:"id"`
	Name *Name          `json:"name"`
	Type *TypeReference `json:"type"`
}
