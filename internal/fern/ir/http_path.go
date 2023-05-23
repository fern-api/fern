package ir

type HttpPath struct {
	Head  string          `json:"head"`
	Parts []*HttpPathPart `json:"parts"`
}
