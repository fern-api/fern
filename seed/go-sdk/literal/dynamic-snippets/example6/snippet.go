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
    request := &fern.QuerySendRequest{
        Prompt: fern.QuerySendRequestPromptYouAreAHelpfulAssistant,
        AliasPrompt: fern.AliasToPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        AliasStream: true,
    }
    client.Query.Send(
        context.TODO(),
        request,
    )
}
