package example

import (
    client "github.com/grpc-proto/fern/client"
    option "github.com/grpc-proto/fern/option"
    context "context"
    fern "github.com/grpc-proto/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Userservice.Create(
        context.TODO(),
        &fern.CreateRequest{},
    )
}
