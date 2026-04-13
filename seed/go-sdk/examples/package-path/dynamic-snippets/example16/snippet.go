package example

import (
    context "context"

    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
    request := &pleaseinhere.BigEntity{
        CastMember: &pleaseinhere.CastMember{
            Actor: &pleaseinhere.Actor{
                Name: "name",
                ID: "id",
            },
        },
        ExtendedMovie: &pleaseinhere.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            ID: "id",
            Prequel: pleaseinhere.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
            Type: pleaseinhere.MovieTypeMovie,
            Tag: "tag",
            Book: pleaseinhere.String(
                "book",
            ),
            Metadata: map[string]any{
                "metadata": map[string]any{
                    "key": "value",
                },
            },
            Revenue: int64(1000000),
        },
        Entity: &pleaseinhere.Entity{
            Type: &pleaseinhere.Type{
                BasicType: pleaseinhere.BasicTypePrimitive,
            },
            Name: "name",
        },
        Metadata: &pleaseinhere.Metadata{
            HTML: &pleaseinhere.MetadataHTML{
                Value: pleaseinhere.String(
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
        CommonMetadata: &pleaseinhere.CommonsMetadata{
            ID: "id",
            Data: map[string]*string{
                "data": pleaseinhere.String(
                    "data",
                ),
            },
            JSONString: pleaseinhere.String(
                "jsonString",
            ),
        },
        EventInfo: &pleaseinhere.CommonsEventInfo{
            CommonsEventInfoZero: &pleaseinhere.CommonsEventInfoZero{
                Type: pleaseinhere.CommonsEventInfoZeroTypeMetadata,
                ID: "id",
                Data: map[string]*string{
                    "data": pleaseinhere.String(
                        "data",
                    ),
                },
                JSONString: pleaseinhere.String(
                    "jsonString",
                ),
            },
        },
        Data: &pleaseinhere.CommonsData{
            FieldString: &pleaseinhere.CommonsDataString{
                Value: pleaseinhere.String(
                    "value",
                ),
            },
        },
        Migration: &pleaseinhere.Migration{
            Name: "name",
            Status: pleaseinhere.MigrationStatusRunning,
        },
        Exception: &pleaseinhere.Exception{
            ExceptionZero: &pleaseinhere.ExceptionZero{
                Type: pleaseinhere.ExceptionZeroTypeGeneric,
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &pleaseinhere.Test{
            And: &pleaseinhere.TestAnd{
                Value: pleaseinhere.Bool(
                    true,
                ),
            },
        },
        Node: &pleaseinhere.Node{
            Name: "name",
            Nodes: []*pleaseinhere.Node{
                &pleaseinhere.Node{
                    Name: "name",
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                        },
                    },
                    Trees: []*pleaseinhere.Tree{
                        &pleaseinhere.Tree{},
                        &pleaseinhere.Tree{},
                    },
                },
                &pleaseinhere.Node{
                    Name: "name",
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                        },
                    },
                    Trees: []*pleaseinhere.Tree{
                        &pleaseinhere.Tree{},
                        &pleaseinhere.Tree{},
                    },
                },
            },
            Trees: []*pleaseinhere.Tree{
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{},
                },
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{},
                },
            },
        },
        Directory: &pleaseinhere.Directory{
            Name: "name",
            Files: []*pleaseinhere.File{
                &pleaseinhere.File{
                    Name: "name",
                    Contents: "contents",
                },
                &pleaseinhere.File{
                    Name: "name",
                    Contents: "contents",
                },
            },
            Directories: []*pleaseinhere.Directory{
                &pleaseinhere.Directory{
                    Name: "name",
                    Files: []*pleaseinhere.File{},
                    Directories: []*pleaseinhere.Directory{
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                    },
                },
                &pleaseinhere.Directory{
                    Name: "name",
                    Files: []*pleaseinhere.File{},
                    Directories: []*pleaseinhere.Directory{
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                    },
                },
            },
        },
        Moment: &pleaseinhere.Moment{
            ID: "id",
            Date: pleaseinhere.MustParseDate(
                "2023-01-15",
            ),
            Datetime: pleaseinhere.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        },
    }
    client.Service.Createbigentity(
        context.TODO(),
        request,
    )
}
