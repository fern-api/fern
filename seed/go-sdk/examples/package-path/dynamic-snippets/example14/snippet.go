package example

import (
    context "context"

    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
    _, err := client.Service.GetMovie(
        context.TODO(),
        "movieId",
    )
    if err != nil {
        return err
    }
    return nil
}
