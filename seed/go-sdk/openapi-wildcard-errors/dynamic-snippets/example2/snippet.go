package example

import (
    context "context"

    fern "github.com/openapi-wildcard-errors/fern"
    client "github.com/openapi-wildcard-errors/fern/client"
    option "github.com/openapi-wildcard-errors/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateItemRequest{
        Name: "name",
    }
    client.Items.CreateItem(
        context.TODO(),
        request,
    )
}
