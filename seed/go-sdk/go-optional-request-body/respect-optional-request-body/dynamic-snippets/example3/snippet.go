package example

import (
    context "context"

    client "github.com/go-optional-request-body/fern/client"
    option "github.com/go-optional-request-body/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.WaterAllPlants(
        context.TODO(),
        nil,
    )
}
