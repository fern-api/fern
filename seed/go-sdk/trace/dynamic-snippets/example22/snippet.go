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
    err := client.Problem.DeleteProblem(
        context.TODO(),
        "problemId",
    )
    if err != nil {
        return err
    }
    return nil
}
