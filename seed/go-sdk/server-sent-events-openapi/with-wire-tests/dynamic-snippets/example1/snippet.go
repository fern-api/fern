package example

import (
    context "context"

    fern "github.com/server-sent-events-openapi/fern"
    client "github.com/server-sent-events-openapi/fern/client"
    option "github.com/server-sent-events-openapi/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.StreamRequest{
        Query: fern.String(
            "query",
        ),
    }
    _, err := client.StreamProtocolNoCollision(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
