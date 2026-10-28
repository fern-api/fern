package example

import (
    context "context"

    client "github.com/nullable-allof-extends/fern/client"
    option "github.com/nullable-allof-extends/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.GetTest(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
