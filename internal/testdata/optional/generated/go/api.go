package api

type Type struct {
	Name string `json:"name"`
}

type AnotherType struct {
	String *string `json:"string"`
	Type   *Type   `json:"type"`
}
