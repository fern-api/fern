package ir

type ErrorDiscriminationByPropertyStrategy struct {
	Discriminant    *NameAndWireValue `json:"discriminant"`
	ContentProperty *NameAndWireValue `json:"contentProperty"`
}
