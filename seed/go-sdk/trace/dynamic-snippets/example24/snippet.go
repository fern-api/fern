package example

import (
    context "context"

    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
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
    _, err := client.Submission.CreateExecutionSession(
        context.TODO(),
        common.LanguageJava.Ptr(),
    )
    if err != nil {
        return err
    }
    return nil
}
