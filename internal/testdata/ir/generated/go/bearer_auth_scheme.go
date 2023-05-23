package ir

type BearerAuthScheme struct {
	Docs  *string `json:"docs"`
	Token *Name   `json:"token"`
}
