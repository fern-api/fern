package ir

type PathParameter struct {
	Docs      *string               `json:"docs"`
	Name      *Name                 `json:"name"`
	ValueType *TypeReference        `json:"valueType"`
	Location  PathParameterLocation `json:"location"`
	Variable  *VariableId           `json:"variable"`
}
