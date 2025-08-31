package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    context "context"
    fern "github.com/nullable-optional/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.NullableOptional.GetSearchResults(
        context.TODO(),
        &fern.SearchRequest{
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
        },
    )
}
