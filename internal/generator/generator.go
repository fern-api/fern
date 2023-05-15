package generator

// Generator represents the Go code generator.
type Generator struct {
	config *Config
}

// New returns a new *Generator.
func New(config *Config) *Generator {
	return &Generator{
		config: config,
	}
}

// Run runs the code generation process.
func (g *Generator) Run() error {
	return nil
}
