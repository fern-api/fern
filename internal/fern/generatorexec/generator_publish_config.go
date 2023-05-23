package generatorexec

type GeneratorPublishConfig struct {
	Registries    *GeneratorRegistriesConfig   `json:"registries"`
	RegistriesV2  *GeneratorRegistriesConfigV2 `json:"registriesV2"`
	PublishTarget *GeneratorPublishTarget      `json:"publishTarget"`
	Version       string                       `json:"version"`
}
