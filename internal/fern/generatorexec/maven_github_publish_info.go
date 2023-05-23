package generatorexec

type MavenGithubPublishInfo struct {
	RegistryUrl                 string              `json:"registryUrl"`
	Coordinate                  string              `json:"coordinate"`
	UsernameEnvironmentVariable EnvironmentVariable `json:"usernameEnvironmentVariable"`
	PasswordEnvironmentVariable EnvironmentVariable `json:"passwordEnvironmentVariable"`
}
