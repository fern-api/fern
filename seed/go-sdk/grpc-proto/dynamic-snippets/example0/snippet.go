package example

import (
    client "github.com/grpc-proto/fern/client"
    context "context"
    fern "github.com/grpc-proto/fern"
)

func do() () {
    client := client.NewClient()
    client.Userservice.Create(
        context.TODO(),
        &fern.CreateRequest{},
    )
}
