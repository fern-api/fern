package example

import (
    context "context"

    fern "github.com/go-optional-literal-alias/fern"
    client "github.com/go-optional-literal-alias/fern/client"
    option "github.com/go-optional-literal-alias/fern/option"
)

func do() error {
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
    _, err := client.Search(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
