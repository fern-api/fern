package example

import (
    client "github.com/literal/fern/client"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient()
    client.Query.Send(
        context.TODO(),
        &fern.SendLiteralsInQueryRequest{
            Query: "query",
        },
    )
}
