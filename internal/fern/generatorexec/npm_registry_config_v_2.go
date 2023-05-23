package generatorexec

type NpmRegistryConfigV2 struct {
	RegistryUrl string `json:"registryUrl"`
	Token       string `json:"token"`
	PackageName string `json:"packageName"`
}
