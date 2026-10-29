package example

import (
    context "context"

    fern "github.com/x-fern-default/fern"
    client "github.com/x-fern-default/fern/client"
    option "github.com/x-fern-default/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TestGetRequest{
        Region: "region",
    }
    _, err := client.TestGet(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
