package example

import (
    context "context"

    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
    option "github.com/trace/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := []common.ProblemID{
        "string",
        "string",
    }
    client.Homepage.SetHomepageProblems(
        context.TODO(),
        request,
    )
}
