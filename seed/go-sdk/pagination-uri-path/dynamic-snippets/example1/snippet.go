package example

import (
    client "github.com/pagination-uri-path/fern/client"
    option "github.com/pagination-uri-path/fern/option"
    context "context"
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
    client.Users.ListWithPathPagination(
        context.TODO(),
    )
}
