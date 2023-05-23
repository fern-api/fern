package ir

type MultipleBaseUrlsEnvironments struct {
	BaseUrls     []*EnvironmentBaseUrlWithId    `json:"baseUrls"`
	Environments []*MultipleBaseUrlsEnvironment `json:"environments"`
}
