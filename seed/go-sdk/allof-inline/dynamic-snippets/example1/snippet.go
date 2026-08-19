package example

import (
    context "context"

    fern "github.com/allof-inline/fern"
    client "github.com/allof-inline/fern/client"
    option "github.com/allof-inline/fern/option"
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
