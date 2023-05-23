package ir

type SingleBaseUrlEnvironment struct {
	Docs *string        `json:"docs"`
	Id   EnvironmentId  `json:"id"`
	Name *Name          `json:"name"`
	Url  EnvironmentUrl `json:"url"`
}
