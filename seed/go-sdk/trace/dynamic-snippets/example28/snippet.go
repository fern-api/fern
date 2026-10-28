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
    err := client.Sysprop.SetNumWarmInstances(
        context.TODO(),
        common.LanguageJava.Ptr(),
        1,
    )
    if err != nil {
        return err
    }
    return nil
}
