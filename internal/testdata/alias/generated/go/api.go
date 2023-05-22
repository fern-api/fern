package api

import (
	uuid "github.com/gofrs/uuid"
	time "time"
)

type Double = float64

type OptionalLong = *int64

type ListOptionalUuid = []*uuid.UUID

type FooAlias = *Foo

type DateTime = time.Time

type Uuid = uuid.UUID

type IntegerList = []int

type StringBooleanMap = map[string]bool

type Unknown = any

type ListListInteger = [][]int

type BarAlias = *Bar

type Integer = int

type Long = int64

type ListStringIntegerMap = []map[string]int

type Bar struct {
	Foo *Foo `json:"foo"`
}

type String = string

type Boolean = bool

type Date = time.Time

type Base64 = []byte

type DoubleSet = []float64

type Foo struct {
	Id   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
