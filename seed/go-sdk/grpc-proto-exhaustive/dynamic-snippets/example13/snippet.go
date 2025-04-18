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
    client.Dataservice.Update(
        context.TODO(),
        &fern.UpdateRequest{
            Id: "id",
            Values: []float64{
                1.1,
                1.1,
            },
            SetMetadata: &fern.Metadata{
                StringMetadataValueMap: map[string]*fern.MetadataValue{
                    "setMetadata": &fern.MetadataValue{
                        Double: 1.1,
                    },
                },
            },
            Namespace: fern.String(
                "namespace",
            ),
            IndexedData: &fern.IndexedData{
                Indices: []int{
                    1,
                    1,
                },
                Values: []float64{
                    1.1,
                    1.1,
                },
            },
        },
    )
}
