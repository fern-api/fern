package example

import (
    context "context"

    pleaseinhere "github.com/examples/fern/pleaseinhere"
    client "github.com/examples/fern/pleaseinhere/client"
    commons "github.com/examples/fern/pleaseinhere/commons"
    option "github.com/examples/fern/pleaseinhere/option"
    uuid "github.com/google/uuid"
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
                Id: "id",
            },
        },
        ExtendedMovie: &pleaseinhere.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            Id: "id",
            Prequel: pleaseinhere.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
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
            Extra: map[string]string{
                "extra": "extra",
            },
            Tags: []string{
                "tags",
            },
        },
        CommonMetadata: &commons.Metadata{
            Id: "id",
            Data: map[string]string{
                "data": "data",
            },
            JsonString: pleaseinhere.String(
                "jsonString",
            ),
        },
        EventInfo: &commons.EventInfo{
            Metadata: &commons.Metadata{
                Id: "id",
                Data: map[string]string{
                    "data": "data",
                },
                JsonString: pleaseinhere.String(
                    "jsonString",
                ),
            },
        },
        Data: &commons.Data{},
        Migration: &pleaseinhere.Migration{
            Name: "name",
            Status: pleaseinhere.MigrationStatusRunning,
        },
        Exception: &pleaseinhere.Exception{
            Generic: &pleaseinhere.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &pleaseinhere.Test{},
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
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
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
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                        &pleaseinhere.Tree{
                            Nodes: []*pleaseinhere.Node{},
                        },
                    },
                },
            },
            Trees: []*pleaseinhere.Tree{
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
                },
                &pleaseinhere.Tree{
                    Nodes: []*pleaseinhere.Node{
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                        &pleaseinhere.Node{
                            Name: "name",
                            Nodes: []*pleaseinhere.Node{},
                            Trees: []*pleaseinhere.Tree{},
                        },
                    },
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
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                    },
                },
                &pleaseinhere.Directory{
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
                        },
                        &pleaseinhere.Directory{
                            Name: "name",
                        },
                    },
                },
            },
        },
        Moment: &pleaseinhere.Moment{
            Id: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            Date: pleaseinhere.MustParseDate(
                "2023-01-15",
            ),
            Datetime: pleaseinhere.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        },
    }
    client.Service.CreateBigEntity(
        context.TODO(),
        request,
    )
}
