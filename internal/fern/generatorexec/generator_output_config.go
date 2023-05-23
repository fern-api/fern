package generatorexec

type GeneratorOutputConfig struct {
	Path string      `json:"path"`
	Mode *OutputMode `json:"mode"`
}
