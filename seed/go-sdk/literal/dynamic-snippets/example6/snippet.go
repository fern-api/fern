package example

import (
    context "context"

    fern "github.com/literal/fern"
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendLiteralsInQueryRequest{
        AliasPrompt: fern.AliasToPrompt(
            "You are a helpful assistant",
        ),
        AliasOptionalPrompt: fern.String(
            "You are a helpful assistant",
        ),
        AliasStream: fern.AliasToStream(
            false,
        ),
        AliasOptionalStream: fern.Bool(
            false,
        ),
        Query: "What is the weather today",
    }
    client.Query.Send(
        context.TODO(),
        request,
    )
}
