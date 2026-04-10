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
    request := &fern.ServiceListResourcesRequest{
        PageLimit: 1,
        BeforeDate: fern.MustParseDate(
            "2023-01-15",
        ),
    }
    client.Service.Listresources(
        context.TODO(),
        request,
    )
}
