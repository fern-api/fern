package example

import (
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
    fern "github.com/literal/fern"
    context "context"
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
        Query: "query",
        AliasStream: fern.AliasToStream(
            false,
        ),
        AliasOptionalStream: fern.Bool(
            false,
        ),
    }
    client.Query.Send(
        context.TODO(),
        request,
    )
}
