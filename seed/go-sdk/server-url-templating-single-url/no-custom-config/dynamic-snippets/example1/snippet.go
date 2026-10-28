package example

import (
    context "context"

    client "github.com/server-url-templating-single-url/fern/client"
    option "github.com/server-url-templating-single-url/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.GetUsers(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
