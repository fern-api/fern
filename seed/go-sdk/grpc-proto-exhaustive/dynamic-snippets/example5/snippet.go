package example

import (
    client "github.com/grpc-proto-exhaustive/fern/client"
    option "github.com/grpc-proto-exhaustive/fern/option"
    context "context"
    fern "github.com/grpc-proto-exhaustive/fern"
)

func do() () {
    client := client.NewClient(
        option.WithApiKey(
            "<value>",
        ),
    )
    client.Dataservice.Delete(
        context.TODO(),
        &fern.DeleteRequest{
            Ids: []string{
                "ids",
                "ids",
            },
            DeleteAll: fern.Bool(
                true,
            ),
            Namespace: fern.String(
                "namespace",
            ),
            Filter: &fern.Metadata{
                StringMetadataValueMap: map[string]*fern.MetadataValue{
                    "filter": &fern.MetadataValue{
                        Double: 1.1,
                    },
                },
            },
        },
    )
}
