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
    request := &fern.SendRequest{
        Prompt: fern.SendRequestPromptYouAreAHelpfulAssistant,
        Query: "query",
        Stream: true,
        Ending: fern.SendRequestEndingEnding,
        Context: fern.SomeLiteralYoureSuperWise,
        ContainerObject: &fern.ContainerObject{
            NestedObjects: []*fern.NestedObjectWithLiterals{
                &fern.NestedObjectWithLiterals{
                    Literal1: fern.NestedObjectWithLiteralsLiteral1Literal1,
                    Literal2: fern.NestedObjectWithLiteralsLiteral2Literal2,
                    StrProp: "strProp",
                },
            },
        },
    }
    client.Reference.Send(
        context.TODO(),
        request,
    )
}
