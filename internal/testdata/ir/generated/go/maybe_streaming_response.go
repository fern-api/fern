package ir

type MaybeStreamingResponse struct {
	Condition    *StreamCondition   `json:"condition"`
	NonStreaming *HttpResponse      `json:"nonStreaming"`
	Streaming    *StreamingResponse `json:"streaming"`
}
