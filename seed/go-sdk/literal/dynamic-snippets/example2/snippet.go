package example

import (
    client "github.com/literal/fern/client"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient()
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
