package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    context "context"
    fern "github.com/nullable-optional/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.NullableOptional.UpdateTags(
        context.TODO(),
        "userId",
        &fern.UpdateTagsRequest{
            Tags: []string{
                "tags",
                "tags",
            },
            Categories: []string{
                "categories",
                "categories",
            },
            Labels: []string{
                "labels",
                "labels",
            },
        },
    )
}
