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
    request := &fern.InlinedSendRequest{
        Prompt: fern.InlinedSendRequestPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        AliasedContext: fern.SomeAliasedLiteralYoureSuperWise,
        ObjectWithLiteral: &fern.ATopLevelLiteral{
            NestedLiteral: &fern.ANestedLiteral{
                MyLiteral: fern.ANestedLiteralMyLiteralHowSuperCool,
            },
        },
    }
    client.Inlined.Send(
        context.TODO(),
        request,
    )
}
