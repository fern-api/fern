package coordinator

import (
	"context"
	"net/http"
	"time"

	"github.com/fern-api/fern-go/internal/fern/generatorexec"
)

// Client represents the Fern coordinator client.
type Client struct {
	client generatorexec.Service
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
	return c.client.SendUpdate(
		ctx,
		c.taskID,
		[]*generatorexec.GeneratorUpdate{generatorUpdate},
	)
}

func newGeneratorexecClient(url string) (generatorexec.Service, error) {
	if url == "" {
		return &nopCoordinatorClient{}, nil
	}
	return generatorexec.NewClient(url, http.DefaultClient)
}

type nopCoordinatorClient struct{}

func (*nopCoordinatorClient) SendUpdate(_ context.Context, _ generatorexec.TaskId, _ []*generatorexec.GeneratorUpdate) error {
	return nil
}
