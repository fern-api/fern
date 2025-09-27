package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    fern "github.com/pagination/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.SearchRequest{
        Pagination: &fern.StartingAfterPaging{
            PerPage: 1,
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
        Query: &fern.SearchRequestQuery{
            SingleFilterSearchRequest: &fern.SingleFilterSearchRequest{
                Field: fern.String(
                    "field",
                ),
                Operator: fern.SingleFilterSearchRequestOperatorEquals.Ptr(),
                Value: fern.String(
                    "value",
                ),
            },
        },
    }
    client.Complex.Search(
        context.TODO(),
        "index",
        request,
    )
}
