package example

import (
    client "github.com/empty-schema/fern/client"
    option "github.com/empty-schema/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Entities.GetEntities(
        context.TODO(),
    )
}
