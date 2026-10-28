package example

import (
    context "context"

    client "github.com/openapi-subtitle/fern/client"
    option "github.com/openapi-subtitle/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.ListPlants(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
