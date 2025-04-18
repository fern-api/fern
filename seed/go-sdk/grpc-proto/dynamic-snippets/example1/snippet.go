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
        &fern.CreateRequest{
            Username: fern.String(
                "username",
            ),
            Email: fern.String(
                "email",
            ),
            Age: fern.Int(
                1,
            ),
            Weight: fern.Float64(
                1.1,
            ),
            Metadata: &fern.Metadata{
                StringMetadataValueMap: map[string]*fern.MetadataValue{
                    "metadata": &fern.MetadataValue{
                        Double: 1.1,
                    },
                },
            },
        },
    )
}
