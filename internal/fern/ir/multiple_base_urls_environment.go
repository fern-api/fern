package ir

type MultipleBaseUrlsEnvironment struct {
	Docs *string                                 `json:"docs"`
	Id   EnvironmentId                           `json:"id"`
	Name *Name                                   `json:"name"`
	Urls map[EnvironmentBaseUrlId]EnvironmentUrl `json:"urls"`
}
