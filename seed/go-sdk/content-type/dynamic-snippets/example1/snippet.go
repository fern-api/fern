package example

import (
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
    context "context"
    fern "github.com/content-type/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.PatchComplex(
        context.TODO(),
        "id",
        &fern.PatchComplexRequest{
            Name: fern.String(
                "name",
            ),
            Email: fern.String(
                "email",
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
        },
    )
}
