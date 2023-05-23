package generatorexec

type NpmGithubPublishInfo struct {
	RegistryUrl              string              `json:"registryUrl"`
	PackageName              string              `json:"packageName"`
	TokenEnvironmentVariable EnvironmentVariable `json:"tokenEnvironmentVariable"`
}
