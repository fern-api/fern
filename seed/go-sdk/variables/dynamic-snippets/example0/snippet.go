package example

import (
    context "context"

    client "github.com/variables/fern/client"
    option "github.com/variables/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithRootVariable(
            "<endpointParam>",
        ),
    )
    err := client.Service.Post(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
