package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() error {
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
    _, err := client.NullableOptional.UpdateTags(
        context.TODO(),
        "userId",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
