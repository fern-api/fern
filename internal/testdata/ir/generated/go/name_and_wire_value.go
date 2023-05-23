package ir

type NameAndWireValue struct {
	WireValue string `json:"wireValue"`
	Name      *Name  `json:"name"`
}
