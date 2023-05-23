package ir

type ExampleInlinedRequestBody struct {
	JsonExample any                                  `json:"jsonExample"`
	Properties  []*ExampleInlinedRequestBodyProperty `json:"properties"`
}
