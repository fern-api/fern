package example

import (
    context "context"

    fern "github.com/openapi-wildcard-errors/fern"
    client "github.com/openapi-wildcard-errors/fern/client"
    option "github.com/openapi-wildcard-errors/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateItemRequest{
        Name: "name",
    }
    _, err := client.Items.CreateItem(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
