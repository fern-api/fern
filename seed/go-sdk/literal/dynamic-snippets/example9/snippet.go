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
    request := &fern.SendLiteralsInQueryRequest{
        OptionalPrompt: fern.String(
            "You are a helpful assistant",
        ),
        AliasPrompt: fern.AliasToPrompt(
            "You are a helpful assistant",
        ),
        AliasOptionalPrompt: fern.String(
            "You are a helpful assistant",
        ),
        Query: "query",
        OptionalStream: fern.Bool(
            false,
        ),
        AliasStream: fern.AliasToStream(
            false,
        ),
        AliasOptionalStream: fern.Bool(
            false,
        ),
    }
    _, err := client.Query.Send(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
