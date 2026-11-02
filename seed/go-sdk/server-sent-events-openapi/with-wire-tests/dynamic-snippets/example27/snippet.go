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
    request := &fern.StreamXFernStreamingUnionStreamRequest{
        Message: &fern.UnionStreamMessageVariant{
            StreamResponse: fern.Bool(
                true,
            ),
            Prompt: "prompt",
            Message: "message",
        },
    }
    _, err := client.StreamXFernStreamingUnionStream(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
