package example

import (
    context "context"

    fern "github.com/allof/fern"
    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchRuleTypesRequest{
        Query: fern.String(
            "query",
        ),
    }
    _, err := client.SearchRuleTypes(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
