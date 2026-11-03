package example

import (
    context "context"

    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    _, err := client.V2.V3.Problem.GetProblemVersion(
        context.TODO(),
        "problemId",
        1,
    )
    if err != nil {
        return err
    }
    return nil
}
