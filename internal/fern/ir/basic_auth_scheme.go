package ir

type BasicAuthScheme struct {
	Docs     *string `json:"docs"`
	Username *Name   `json:"username"`
	Password *Name   `json:"password"`
}
