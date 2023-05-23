package ir

type InlinedRequestBodyProperty struct {
	Docs      *string           `json:"docs"`
	Name      *NameAndWireValue `json:"name"`
	ValueType *TypeReference    `json:"valueType"`
}
