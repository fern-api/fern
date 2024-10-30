package example

import (
    client "github.com/grpc-proto-exhaustive/fern/client"
    context "context"
    fern "github.com/grpc-proto-exhaustive/fern"
)

func do() () {
    client := client.NewClient()
    client.Dataservice.Fetch(
        context.TODO(),
        &fern.FetchRequest{
            Ids: []*string{
                fern.String(
                    "ids",
                ),
            },
            Namespace: fern.String(
                "namespace",
            ),
        },
    )
}
