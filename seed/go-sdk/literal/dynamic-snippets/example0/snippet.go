package example

import (
    context "context"

    fern "github.com/literal/fern"
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendLiteralsInHeadersRequest{
        Query: "What is the weather today",
    }
    _, err := client.Headers.Send(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
