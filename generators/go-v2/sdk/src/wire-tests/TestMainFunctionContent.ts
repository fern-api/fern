export const TEST_MAIN_FUNCTION_CONTENT = `
// TestMain sets up shared test fixtures for all tests in this package// Global test fixtures
var (
	WireMockContainer *wiremocktestcontainersgo.WireMockContainer
	WireMockBaseURL   string
	WireMockClient    *gowiremock.Client
)

// TestMain sets up shared test fixtures for all tests in this package
func TestMain(m *testing.M) {
	// Setup shared WireMock container
	ctx := context.Background()
	container, err := wiremocktestcontainersgo.RunContainerAndStopOnCleanup(
		ctx,
		&testing.T{},
		wiremocktestcontainersgo.WithImage("docker.io/wiremock/wiremock:3.9.1"),
	)
	if err != nil {
		fmt.Printf("Failed to start WireMock container: %v\\n", err)
		os.Exit(1)
	}

	// Store global references
	WireMockContainer = container

	// Try to get the base URL using the standard method first
	baseURL, err := container.Endpoint(ctx, "")
	if err == nil {
		// Standard method worked (running outside DinD)
		WireMockBaseURL = "http://" + baseURL
		WireMockClient = container.Client
	} else {
		// Standard method failed, use internal IP fallback (DinD environment)
		fmt.Printf("Standard endpoint resolution failed, using internal IP fallback: %v\\n", err)
		
		inspect, err := container.Inspect(ctx)
		if err != nil {
			fmt.Printf("Failed to inspect WireMock container: %v\\n", err)
			os.Exit(1)
		}

		// Find the IP address from the container's networks
		var containerIP string
		for _, network := range inspect.NetworkSettings.Networks {
			if network.IPAddress != "" {
				containerIP = network.IPAddress
				break
			}
		}

		if containerIP == "" {
			fmt.Printf("Failed to get WireMock container IP address\\n")
			os.Exit(1)
		}

		// Get the exposed port from the container config
		var containerPort string
		for port := range inspect.Config.ExposedPorts {
			// Get the first TCP port (WireMock uses TCP)
			if port.Proto() == "tcp" {
				containerPort = port.Port()
				break
			}
		}

		if containerPort == "" {
			fmt.Printf("Failed to get WireMock container port\\n")
			os.Exit(1)
		}

		// Construct the URL using internal IP and port
		WireMockBaseURL = fmt.Sprintf("http://%s:%s", containerIP, containerPort)
		// reconstruct the client with the newly derived internal URL
		WireMockClient = gowiremock.NewClient(WireMockBaseURL)
	}

	fmt.Printf("WireMock available at: %s\\n", WireMockBaseURL)

	// Run all tests
	code := m.Run()

	// Cleanup
	if WireMockContainer != nil {
		WireMockContainer.Terminate(ctx)
	}

	// Exit with the same code as the tests
	os.Exit(code)
}
`;

export const TEST_MAIN_FUNCTION_IMPORTS = [
    "context",
    "fmt",
    "os",
    "testing",
    "github.com/wiremock/go-wiremock",
    "github.com/wiremock/wiremock-testcontainers-go"
];
