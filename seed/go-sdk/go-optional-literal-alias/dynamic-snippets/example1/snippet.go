package example

import (
    context "context"

    fern "github.com/go-optional-literal-alias/fern"
    client "github.com/go-optional-literal-alias/fern/client"
    option "github.com/go-optional-literal-alias/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchRequest{
        SortField: fern.String(
            "DEFAULT",
        ),
        Query: "query",
    }
    client.Search(
        context.TODO(),
        request,
    )
}
