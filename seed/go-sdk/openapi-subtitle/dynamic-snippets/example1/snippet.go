package example

import (
    context "context"

    client "github.com/openapi-subtitle/fern/client"
    option "github.com/openapi-subtitle/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.ListPlants(
        context.TODO(),
    )
}
