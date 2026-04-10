package example

import (
    context "context"

    fern "github.com/query-parameters/fern"
    client "github.com/query-parameters/fern/client"
    option "github.com/query-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UserGetUsernameRequest{
        Limit: 1,
        ID: "id",
        Date: fern.MustParseDate(
            "2023-01-15",
        ),
        Deadline: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        Bytes: "bytes",
        User: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
        UserList: []*fern.User{
            &fern.User{
                Name: "name",
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
        KeyValue: map[string]string{
            "keyValue": "keyValue",
        },
        OptionalString: fern.String(
            "optionalString",
        ),
        NestedUser: &fern.NestedUser{
            Name: "name",
            User: &fern.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        },
        OptionalUser: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
        ExcludeUser: []*fern.User{
            &fern.User{
                Name: "name",
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
    }
    client.User.Getusername(
        context.TODO(),
        request,
    )
}
