package ir

type AliasTypeDeclaration struct {
	AliasOf      *TypeReference         `json:"aliasOf"`
	ResolvedType *ResolvedTypeReference `json:"resolvedType"`
}
