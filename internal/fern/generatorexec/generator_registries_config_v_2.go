package generatorexec

type GeneratorRegistriesConfigV2 struct {
	Maven *MavenRegistryConfigV2 `json:"maven"`
	Npm   *NpmRegistryConfigV2   `json:"npm"`
	Pypi  *PypiRegistryConfig    `json:"pypi"`
}
