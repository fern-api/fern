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
    request := &fern.GetItemRequest{
        ItemID: "item_id",
    }
    client.Items.GetItem(
        context.TODO(),
        request,
    )
}
