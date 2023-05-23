package generatorexec

type GeneratorConfig struct {
	DryRun        bool                    `json:"dryRun"`
	IrFilepath    string                  `json:"irFilepath"`
	Output        *GeneratorOutputConfig  `json:"output"`
	Publish       *GeneratorPublishConfig `json:"publish"`
	WorkspaceName string                  `json:"workspaceName"`
	Organization  string                  `json:"organization"`
	CustomConfig  any                     `json:"customConfig"`
	Environment   *GeneratorEnvironment   `json:"environment"`
}
