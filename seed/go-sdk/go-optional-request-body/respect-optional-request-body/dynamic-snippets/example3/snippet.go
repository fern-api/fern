package example

import (
    context "context"

    client "github.com/go-optional-request-body/fern/client"
    option "github.com/go-optional-request-body/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.WaterAllPlants(
        context.TODO(),
        nil,
    )
    if err != nil {
        return err
    }
    return nil
}
