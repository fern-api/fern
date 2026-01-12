package example

import (
    client "github.com/go-optional-literal-alias/fern/client"
    option "github.com/go-optional-literal-alias/fern/option"
    fern "github.com/go-optional-literal-alias/fern"
    context "context"
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
