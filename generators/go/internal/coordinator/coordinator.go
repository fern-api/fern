package coordinator

import (
	"context"
	"time"

	generatorexec "github.com/fern-api/generator-exec-go"
	generatorexecclient "github.com/fern-api/generator-exec-go/client"
	"github.com/fern-api/generator-exec-go/logging"
	"github.com/fern-api/generator-exec-go/readme"
)

// Client represents the Fern coordinator client.
type Client struct {
	client generatorexecclient.Client
	taskID string
}

// NewClient returns a new *Client.
func NewClient(url string, taskID string) *Client {
	client, _ := newGeneratorexecClient(url)
	return &Client{
		client: client,
		taskID: taskID,
	}
}

// GenerateReadme tells the coordinator to generate a README.md with the given request.
func (c *Client) GenerateReadme(request *generatorexec.GenerateReadmeRequest) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	return c.client.Readme().GenerateReadme(
		ctx,
		c.taskID,
		request,
	)
}

// Init sends an initialization update to the coordinator so that it starts to run.
func (c *Client) Init() error {
	return c.send(
		generatorexec.NewGeneratorUpdateFromInitV2(
			&generatorexec.InitUpdateV2{},
		),
	)
}

// Exit sends an exit update to the coordinator so that it stops running.
func (c *Client) Exit(exitStatusUpdate *generatorexec.ExitStatusUpdate) error {
	return c.send(
		generatorexec.NewGeneratorUpdateFromExitStatusUpdate(exitStatusUpdate),
	)
}

// Log sends a log to the coordinator so that it's displayed on the console.
func (c *Client) Log(level generatorexec.LogLevel, message string) error {
	return c.send(
		generatorexec.NewGeneratorUpdateFromLog(
			&generatorexec.LogUpdate{
				Level:   level,
				Message: message,
			},
		),
	)
}

func (c *Client) send(generatorUpdate *generatorexec.GeneratorUpdate) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	return c.client.Logging().SendUpdate(
		ctx,
		c.taskID,
		[]*generatorexec.GeneratorUpdate{generatorUpdate},
	)
}

func newGeneratorexecClient(url string) (generatorexecclient.Client, error) {
	if url == "" {
		return &nopCoordinatorClient{}, nil
	}
	return generatorexecclient.NewClient(
		generatorexecclient.ClientWithBaseURL(url),
	), nil
}

type nopCoordinatorClient struct{}

func (*nopCoordinatorClient) Logging() logging.Client {
	return new(nopCoordinatorLoggingClient)
}

func (*nopCoordinatorClient) Readme() readme.Client {
	return new(nopCoordinatorReadmeClient)
}

type nopCoordinatorLoggingClient struct{}

func (*nopCoordinatorLoggingClient) SendUpdate(_ context.Context, _ generatorexec.TaskId, _ []*generatorexec.GeneratorUpdate) error {
	return nil
}

type nopCoordinatorReadmeClient struct{}

func (*nopCoordinatorReadmeClient) GenerateReadme(_ context.Context, _ generatorexec.TaskId, _ *generatorexec.GenerateReadmeRequest) error {
	return nil
}
