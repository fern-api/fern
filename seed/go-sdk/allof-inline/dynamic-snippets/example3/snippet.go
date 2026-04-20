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
    request := &fern.RuleCreateRequest{
        Name: "name",
        ExecutionContext: fern.RuleExecutionContextProd,
    }
    client.CreateRule(
        context.TODO(),
        request,
    )
}
