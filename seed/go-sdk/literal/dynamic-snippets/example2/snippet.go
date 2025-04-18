package example

import (
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Inlined.Send(
        context.TODO(),
        &fern.SendLiteralsInlinedRequest{
            Temperature: fern.Float64(
                10.1,
            ),
            ObjectWithLiteral: &fern.ATopLevelLiteral{
                NestedLiteral: &fern.ANestedLiteral{},
            },
            Query: "What is the weather today",
        },
    )
}
