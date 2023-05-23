package ir

type ExampleEndpointErrorResponse struct {
	Error *DeclaredErrorName    `json:"error"`
	Body  *ExampleTypeReference `json:"body"`
}
