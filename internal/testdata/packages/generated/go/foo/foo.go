package foo

import (
	generatedgo "github.com/fern-api/fern-go/internal/testdata/packages/generated/go"
)

type Foo struct {
	Foo *generatedgo.Foo `json:"foo"`
}
