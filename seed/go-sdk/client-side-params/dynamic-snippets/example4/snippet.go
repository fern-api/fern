package example

import (
    context "context"

    fern "github.com/client-side-params/fern"
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
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
    request := &fern.GetUserRequest{
        Fields: fern.String(
            "fields",
        ),
        IncludeFields: fern.Bool(
            true,
        ),
    }
    _, err := client.Service.GetUserByID(
        context.TODO(),
        "userId",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
