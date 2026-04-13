package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.BigEntity{
        CastMember: &fern.CastMember{
            Actor: &fern.Actor{
                Name: "name",
                ID: "id",
            },
        },
        ExtendedMovie: &fern.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            ID: "id",
            Prequel: fern.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
            Type: fern.MovieTypeMovie,
            Tag: "tag",
            Book: fern.String(
                "book",
            ),
            Metadata: map[string]any{
                "metadata": map[string]any{
                    "key": "value",
                },
            },
            Revenue: int64(1000000),
        },
        Entity: &fern.Entity{
            Type: &fern.Type{
                BasicType: fern.BasicTypePrimitive,
            },
            Name: "name",
        },
        Metadata: &fern.Metadata{
            HTML: &fern.MetadataHTML{
                Value: fern.String(
                    "value",
                ),
            },
            Extra: map[string]string{
                "extra": "extra",
            },
            Tags: []string{
                "tags",
                "tags",
            },
        },
        CommonMetadata: &fern.CommonsMetadata{
            ID: "id",
            Data: map[string]*string{
                "data": fern.String(
                    "data",
                ),
            },
            JSONString: fern.String(
                "jsonString",
            ),
        },
        EventInfo: &fern.CommonsEventInfo{
            CommonsEventInfoZero: &fern.CommonsEventInfoZero{
                Type: fern.CommonsEventInfoZeroTypeMetadata,
                ID: "id",
                Data: map[string]*string{
                    "data": fern.String(
                        "data",
                    ),
                },
                JSONString: fern.String(
                    "jsonString",
                ),
            },
        },
        Data: &fern.CommonsData{
            FieldString: &fern.CommonsDataString{
                Value: fern.String(
                    "value",
                ),
            },
        },
        Migration: &fern.Migration{
            Name: "name",
            Status: fern.MigrationStatusRunning,
        },
        Exception: &fern.Exception{
            ExceptionZero: &fern.ExceptionZero{
                Type: fern.ExceptionZeroTypeGeneric,
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &fern.Test{
            And: &fern.TestAnd{
                Value: fern.Bool(
                    true,
                ),
            },
        },
        Node: &fern.Node{
            Name: "name",
            Nodes: []*fern.Node{
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                        },
                        &fern.Node{
                            Name: "name",
                        },
                    },
                    Trees: []*fern.Tree{
                        &fern.Tree{},
                        &fern.Tree{},
                    },
                },
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                        },
                        &fern.Node{
                            Name: "name",
                        },
                    },
                    Trees: []*fern.Tree{
                        &fern.Tree{},
                        &fern.Tree{},
                    },
                },
            },
            Trees: []*fern.Tree{
                &fern.Tree{
                    Nodes: []*fern.Node{},
                },
                &fern.Tree{
                    Nodes: []*fern.Node{},
                },
            },
        },
        Directory: &fern.Directory{
            Name: "name",
            Files: []*fern.File{
                &fern.File{
                    Name: "name",
                    Contents: "contents",
                },
                &fern.File{
                    Name: "name",
                    Contents: "contents",
                },
            },
            Directories: []*fern.Directory{
                &fern.Directory{
                    Name: "name",
                    Files: []*fern.File{},
                    Directories: []*fern.Directory{
                        &fern.Directory{
                            Name: "name",
                        },
                        &fern.Directory{
                            Name: "name",
                        },
                    },
                },
                &fern.Directory{
                    Name: "name",
                    Files: []*fern.File{},
                    Directories: []*fern.Directory{
                        &fern.Directory{
                            Name: "name",
                        },
                        &fern.Directory{
                            Name: "name",
                        },
                    },
                },
            },
        },
        Moment: &fern.Moment{
            ID: "id",
            Date: fern.MustParseDate(
                "2023-01-15",
            ),
            Datetime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        },
    }
    client.Service.Createbigentity(
        context.TODO(),
        request,
    )
}
