package example

import (
    client "github.com/grpc-proto-exhaustive/fern/client"
    option "github.com/grpc-proto-exhaustive/fern/option"
    context "context"
    fern "github.com/grpc-proto-exhaustive/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Dataservice.List(
        context.TODO(),
        &fern.ListRequest{
            Prefix: fern.String(
                "prefix",
            ),
            Limit: fern.Int(
                1,
            ),
            PaginationToken: fern.String(
                "paginationToken",
            ),
            Namespace: fern.String(
                "namespace",
            ),
        },
    )
}
