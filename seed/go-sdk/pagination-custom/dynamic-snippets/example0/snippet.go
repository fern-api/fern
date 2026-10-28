package example

import (
    context "context"

    fern "github.com/pagination-custom/fern"
    client "github.com/pagination-custom/fern/client"
    option "github.com/pagination-custom/fern/option"
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
    request := &fern.ListWithCustomPagerRequest{
        Limit: fern.Int(
            1,
        ),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    _, err := client.Users.ListWithCustomPager(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
