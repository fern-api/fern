package example

import (
    context "context"

    client "github.com/pagination-uri-path/fern/client"
    option "github.com/pagination-uri-path/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    _, err := client.Users.ListWithPathPagination(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
