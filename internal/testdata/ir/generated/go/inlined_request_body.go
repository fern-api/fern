package ir

type InlinedRequestBody struct {
	Name       *Name                         `json:"name"`
	Extends    []*DeclaredTypeName           `json:"extends"`
	Properties []*InlinedRequestBodyProperty `json:"properties"`
}
