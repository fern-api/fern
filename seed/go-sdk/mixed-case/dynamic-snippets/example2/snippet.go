package example

import (
    client "github.com/mixed-case/fern/client"
    context "context"
    fern "github.com/mixed-case/fern"
)

func do() () {
    client := client.NewClient()
    client.Service.ListResources(
        context.TODO(),
        &fern.ListResourcesRequest{
            PageLimit: 10,
            BeforeDate: fern.MustParseDateTime(
                "2023-01-01",
            ),
        },
    )
}
