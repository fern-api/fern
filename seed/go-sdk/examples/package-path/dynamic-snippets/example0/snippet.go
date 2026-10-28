package example

import (
    context "context"

    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
    request := "Hello world!\\n\\nwith\\n\\tnewlines"
    _, err := client.Echo(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
