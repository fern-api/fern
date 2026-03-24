package example

import (
    context "context"

    fern "github.com/mixed-case/fern"
    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListResourcesRequest{
        PageLimit: 10,
        BeforeDate: fern.MustParseDate(
            "2023-01-01",
        ),
    }
    client.Service.ListResources(
        context.TODO(),
        request,
    )
}
