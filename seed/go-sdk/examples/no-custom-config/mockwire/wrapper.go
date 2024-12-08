package mockwire

// Run starts a local server to test against
func Run(testCase *TestCase) (*Stub, error) {
	return testCase.init()
}

func (e *TestCase) init() (*Stub, error) {

	// implementation

	return &Stub{
		URL:      "",
		Shutdown: func() {},
	}, nil
}
