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
    client.Dataservice.Upload(
        context.TODO(),
        &fern.UploadRequest{
            Columns: []*fern.Column{
                &fern.Column{
                    Id: "id",
                    Values: []float64{
                        1.1,
                        1.1,
                    },
                    Metadata: &fern.Metadata{
                        StringMetadataValueMap: map[string]*fern.MetadataValue{
                            "metadata": &fern.MetadataValue{
                                Double: 1.1,
                            },
                        },
                    },
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
                &fern.Column{
                    Id: "id",
                    Values: []float64{
                        1.1,
                        1.1,
                    },
                    Metadata: &fern.Metadata{
                        StringMetadataValueMap: map[string]*fern.MetadataValue{
                            "metadata": &fern.MetadataValue{
                                Double: 1.1,
                            },
                        },
                    },
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
            },
            Namespace: fern.String(
                "namespace",
            ),
        },
    )
}
