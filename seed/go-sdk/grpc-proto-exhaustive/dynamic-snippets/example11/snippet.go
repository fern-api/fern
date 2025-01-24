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
    client.Dataservice.Query(
        context.TODO(),
        &fern.QueryRequest{
            Namespace: fern.String(
                "namespace",
            ),
            TopK: 1,
            Filter: &fern.Metadata{
                StringMetadataValueMap: map[string]*fern.MetadataValue{
                    "filter": &fern.MetadataValue{
                        Double: 1.1,
                    },
                },
            },
            IncludeValues: fern.Bool(
                true,
            ),
            IncludeMetadata: fern.Bool(
                true,
            ),
            Queries: []*fern.QueryColumn{
                &fern.QueryColumn{
                    Values: []float64{
                        1.1,
                        1.1,
                    },
                    TopK: fern.Int(
                        1,
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
                &fern.QueryColumn{
                    Values: []float64{
                        1.1,
                        1.1,
                    },
                    TopK: fern.Int(
                        1,
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
            Column: []float64{
                1.1,
                1.1,
            },
            Id: fern.String(
                "id",
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
