package example

import (
    context "context"

    fern "github.com/go-request-body-pagination/fern"
    client "github.com/go-request-body-pagination/fern/client"
    option "github.com/go-request-body-pagination/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersBodyOffsetPaginationRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
    }
    _, err := client.Users.ListWithBodyOffsetPagination(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
