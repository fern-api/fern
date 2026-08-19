package example

import (
    context "context"

    fern "github.com/server-sent-events-openapi/fern"
    client "github.com/server-sent-events-openapi/fern/client"
    option "github.com/server-sent-events-openapi/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.StreamXFernStreamingUnionRequest{
        Message: &fern.UnionStreamMessageVariant{
            StreamResponse: fern.Bool(
                false,
            ),
            Prompt: "prompt",
            Message: "message",
        },
    }
    client.StreamXFernStreamingUnion(
        context.TODO(),
        request,
    )
}
