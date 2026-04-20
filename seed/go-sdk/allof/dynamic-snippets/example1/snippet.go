package example

import (
    context "context"

    fern "github.com/allof/fern"
    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() {
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
    client.SearchRuleTypes(
        context.TODO(),
        request,
    )
}
