package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    fern "github.com/examples/fern"
    commons "github.com/examples/fern/commons"
    uuid "github.com/google/uuid"
    context "context"
)

func do() {
    client := client.New(
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
                Id: "id",
            },
        },
        ExtendedMovie: &fern.ExtendedMovie{
            Cast: []string{
                "cast",
                "cast",
            },
            Id: "id",
            Prequel: fern.String(
                "prequel",
            ),
            Title: "title",
            From: "from",
            Rating: 1.1,
            Tag: "tag",
            Book: fern.String(
                "book",
            ),
            Metadata: map[string]any{
                "metadata": map[string]any{
                    "key": "value",
                },
            },
            Revenue: 1000000,
        },
        Entity: &fern.Entity{
            Type: &fern.Type{
                BasicType: fern.BasicTypePrimitive,
            },
            Name: "name",
        },
        Metadata: &fern.Metadata{
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
            JsonString: fern.String(
                "jsonString",
            ),
        },
        EventInfo: &commons.EventInfo{
            Metadata: &commons.Metadata{
                Id: "id",
                Data: map[string]string{
                    "data": "data",
                },
                JsonString: fern.String(
                    "jsonString",
                ),
            },
        },
        Data: &commons.Data{},
        Migration: &fern.Migration{
            Name: "name",
            Status: fern.MigrationStatusRunning,
        },
        Exception: &fern.Exception{
            Generic: &fern.ExceptionInfo{
                ExceptionType: "exceptionType",
                ExceptionMessage: "exceptionMessage",
                ExceptionStacktrace: "exceptionStacktrace",
            },
        },
        Test: &fern.Test{},
        Node: &fern.Node{
            Name: "name",
            Nodes: []*fern.Node{
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
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
                &fern.Node{
                    Name: "name",
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
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
            },
            Trees: []*fern.Tree{
                &fern.Tree{
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
                },
                &fern.Tree{
                    Nodes: []*fern.Node{
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                        &fern.Node{
                            Name: "name",
                            Nodes: []*fern.Node{},
                            Trees: []*fern.Tree{},
                        },
                    },
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
                            Directories: []*fern.Directory{},
                        },
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                    },
                },
                &fern.Directory{
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
                            Directories: []*fern.Directory{},
                        },
                        &fern.Directory{
                            Name: "name",
                            Files: []*fern.File{},
                            Directories: []*fern.Directory{},
                        },
                    },
                },
            },
        },
        Moment: &fern.Moment{
            Id: uuid.MustParse(
                "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            ),
            Date: fern.MustParseDate(
                "2023-01-15",
            ),
            Datetime: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        },
    }
    client.Service.CreateBigEntity(
        context.TODO(),
        request,
    )
}
