package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    fern "github.com/content-type/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PatchComplexRequest{
        Name: fern.String(
            "name",
        ),
        Age: fern.Int(
            1,
        ),
        Active: fern.Bool(
            true,
        ),
        Metadata: map[string]any{
            "metadata": map[string]any{
                "key": "value",
            },
        },
        Tags: []string{
            "tags",
            "tags",
        },
        Email: fern.String(
            "email",
        ),
        Nickname: fern.String(
            "nickname",
        ),
        Bio: fern.String(
            "bio",
        ),
        ProfileImageUrl: fern.String(
            "profileImageUrl",
        ),
        Settings: map[string]any{
            "settings": map[string]any{
                "key": "value",
            },
        },
    }
    client.Service.PatchComplex(
        context.TODO(),
        "id",
        request,
    )
}
