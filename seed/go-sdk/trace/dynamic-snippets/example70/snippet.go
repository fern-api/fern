package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
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
    request := &fern.V2V3ProblemGetProblemVersionRequest{
        ProblemID: "problemId",
        ProblemVersion: 1,
    }
    client.V2V3Problem.V2V3ProblemGetProblemVersion(
        context.TODO(),
        request,
    )
}
