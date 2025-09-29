package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    fern "github.com/nullable-optional/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdateTagsRequest{
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
    }
    client.NullableOptional.UpdateTags(
        context.TODO(),
        "userId",
        request,
    )
}
