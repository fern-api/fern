package example

import (
    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
    fern "github.com/mixed-case/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListResourcesRequest{
        PageLimit: 1,
        BeforeDate: fern.MustParseDate(
            "2023-01-15",
        ),
    }
    client.Service.ListResources(
        context.TODO(),
        request,
    )
}
