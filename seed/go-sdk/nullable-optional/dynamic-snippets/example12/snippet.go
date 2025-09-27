package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    fern "github.com/nullable-optional/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchRequest{
        Query: "query",
        Filters: map[string]*string{
            "filters": fern.String(
                "filters",
            ),
        },
        IncludeTypes: []string{
            "includeTypes",
            "includeTypes",
        },
    }
    client.NullableOptional.GetSearchResults(
        context.TODO(),
        request,
    )
}
