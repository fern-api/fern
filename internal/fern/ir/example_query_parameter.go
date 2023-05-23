package ir

type ExampleQueryParameter struct {
	WireKey string                `json:"wireKey"`
	Value   *ExampleTypeReference `json:"value"`
}
