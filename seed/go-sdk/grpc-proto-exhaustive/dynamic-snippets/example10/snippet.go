package example

import (
    client "github.com/grpc-proto-exhaustive/fern/client"
    context "context"
    fern "github.com/grpc-proto-exhaustive/fern"
)

func do() () {
    client := client.NewClient()
    client.Dataservice.Query(
        context.TODO(),
        &fern.QueryRequest{
            TopK: 1,
        },
    )
}
