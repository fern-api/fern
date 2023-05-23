package ir

type Declaration struct {
	Docs         *string       `json:"docs"`
	Availability *Availability `json:"availability"`
}
