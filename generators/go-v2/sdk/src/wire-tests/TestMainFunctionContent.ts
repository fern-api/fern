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
	WireMockClient = container.Client

	// Get the base URL
	baseURL, err := container.Endpoint(ctx, "")
	if err != nil {
		fmt.Printf("Failed to get WireMock container endpoint: %v\\n", err)
		os.Exit(1)
	}
	WireMockBaseURL = "http://" + baseURL

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
