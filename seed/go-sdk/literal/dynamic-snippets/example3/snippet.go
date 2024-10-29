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
            Query: "query",
            ObjectWithLiteral: &fern.ATopLevelLiteral{
                NestedLiteral: &fern.ANestedLiteral{},
            },
        },
    )}
