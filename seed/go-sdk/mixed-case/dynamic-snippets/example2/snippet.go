package example

import (
    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
    context "context"
    fern "github.com/mixed-case/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
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
