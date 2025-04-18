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
    client.Dataservice.Describe(
        context.TODO(),
        &fern.DescribeRequest{
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
