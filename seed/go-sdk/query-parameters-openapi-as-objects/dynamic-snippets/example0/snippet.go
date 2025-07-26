package example

import (
    client "github.com/query-parameters-openapi-as-objects/fern/client"
    option "github.com/query-parameters-openapi-as-objects/fern/option"
    context "context"
    fern "github.com/query-parameters-openapi-as-objects/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Search(
        context.TODO(),
        &fern.SearchRequest{
            Limit: 1,
            Id: "id",
            Date: "date",
            Deadline: fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            Bytes: "bytes",
            User: &fern.User{
                Name: fern.String(
                    "name",
                ),
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
            UserList: []*fern.User{
                &fern.User{
                    Name: fern.String(
                        "name",
                    ),
                    Tags: []string{
                        "tags",
                        "tags",
                    },
                },
            },
            OptionalDeadline: fern.Time(
                fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
            KeyValue: map[string]*string{
                "keyValue": fern.String(
                    "keyValue",
                ),
            },
            OptionalString: fern.String(
                "optionalString",
            ),
            NestedUser: &fern.NestedUser{
                Name: fern.String(
                    "name",
                ),
                User: &fern.User{
                    Name: fern.String(
                        "name",
                    ),
                    Tags: []string{
                        "tags",
                        "tags",
                    },
                },
            },
            OptionalUser: &fern.User{
                Name: fern.String(
                    "name",
                ),
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
            ExcludeUser: []*fern.User{
                &fern.User{
                    Name: fern.String(
                        "name",
                    ),
                    Tags: []string{
                        "tags",
                        "tags",
                    },
                },
            },
            Filter: []*string{
                fern.String(
                    "filter",
                ),
            },
            Neighbor: &fern.SearchRequestNeighbor{
                User: &fern.User{
                    Name: fern.String(
                        "name",
                    ),
                    Tags: []string{
                        "tags",
                        "tags",
                    },
                },
            },
            NeighborRequired: &fern.SearchRequestNeighborRequired{
                User: &fern.User{
                    Name: fern.String(
                        "name",
                    ),
                    Tags: []string{
                        "tags",
                        "tags",
                    },
                },
            },
        },
    )
}
