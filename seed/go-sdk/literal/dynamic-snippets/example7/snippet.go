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
        OptionalPrompt: fern.QuerySendRequestOptionalPromptYouAreAHelpfulAssistant.Ptr(),
        AliasPrompt: fern.AliasToPromptYouAreAHelpfulAssistant,
        AliasOptionalPrompt: fern.AliasToPromptYouAreAHelpfulAssistant.Ptr(),
        Query: "query",
        Stream: true,
        OptionalStream: fern.Bool(
            true,
        ),
        AliasStream: true,
        AliasOptionalStream: fern.Bool(
            true,
        ),
    }
    client.Query.Send(
        context.TODO(),
        request,
    )
}
