package ir

type ResponseError struct {
	Docs  *string            `json:"docs"`
	Error *DeclaredErrorName `json:"error"`
}
