package ir

type StreamingResponse struct {
	DataEventType *TypeReference `json:"dataEventType"`
	Terminator    *string        `json:"terminator"`
}
