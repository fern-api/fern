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
    request := &fern.UnionStreamRequestBase{
        Prompt: "prompt",
    }
    _, err := client.ValidateUnionRequest(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
