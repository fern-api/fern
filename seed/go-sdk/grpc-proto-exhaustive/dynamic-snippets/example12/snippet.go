package example

import (
    client "github.com/grpc-proto-exhaustive/fern/client"
    context "context"
    fern "github.com/grpc-proto-exhaustive/fern"
)

func do() () {
    client := client.NewClient()
    client.Dataservice.Update(
        context.TODO(),
        &fern.UpdateRequest{
            Id: "id",
        },
    )
}
