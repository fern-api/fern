package generatorexec

type NpmRegistryConfig struct {
	RegistryUrl string `json:"registryUrl"`
	Token       string `json:"token"`
	Scope       string `json:"scope"`
}
