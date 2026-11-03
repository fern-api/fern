package example

import (
    context "context"

    client "github.com/go-multi-env-url-templating/fern/client"
    option "github.com/go-multi-env-url-templating/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Things.ListThings(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
