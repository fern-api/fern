package example

import (
    context "context"

    client "github.com/basic-auth/fern/client"
    option "github.com/basic-auth/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "<username>",
            "<password>",
        ),
    )
    _, err := client.BasicAuth.GetWithBasicAuth(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
