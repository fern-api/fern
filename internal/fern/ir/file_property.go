package ir

type FileProperty struct {
	Key        *NameAndWireValue `json:"key"`
	IsOptional bool              `json:"isOptional"`
}
