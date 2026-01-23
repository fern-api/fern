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
    request := &fern.SendLiteralsInlinedRequest{
        Query: "query",
        Temperature: fern.Float64(
            1.1,
        ),
        AliasedContext: fern.SomeAliasedLiteral(
            "You're super wise",
        ),
        MaybeContext: &fern.SomeAliasedLiteral(
            "You're super wise",
        ),
        ObjectWithLiteral: &fern.ATopLevelLiteral{
            NestedLiteral: &fern.ANestedLiteral{},
        },
    }
    client.Inlined.Send(
        context.TODO(),
        request,
    )
}
