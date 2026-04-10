package example

import (
    context "context"

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
    client.V2V3Problem.V2V3ProblemGetLightweightProblems(
        context.TODO(),
    )
}
