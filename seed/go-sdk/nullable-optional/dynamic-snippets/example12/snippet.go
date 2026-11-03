package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() error {
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
    _, err := client.NullableOptional.GetSearchResults(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
