package generatorexec

type GeneratorRegistriesConfig struct {
	Maven *MavenRegistryConfig `json:"maven"`
	Npm   *NpmRegistryConfig   `json:"npm"`
}
