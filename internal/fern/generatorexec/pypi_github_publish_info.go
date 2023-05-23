package generatorexec

type PypiGithubPublishInfo struct {
	RegistryUrl                 string              `json:"registryUrl"`
	PackageName                 string              `json:"packageName"`
	UsernameEnvironmentVariable EnvironmentVariable `json:"usernameEnvironmentVariable"`
	PasswordEnvironmentVariable EnvironmentVariable `json:"passwordEnvironmentVariable"`
}
