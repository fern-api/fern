package ir

type ExampleTypeReference struct {
	JsonExample any                        `json:"jsonExample"`
	Shape       *ExampleTypeReferenceShape `json:"shape"`
}
