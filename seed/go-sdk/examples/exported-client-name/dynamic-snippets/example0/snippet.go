package example

import (
    context "context"

    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcmeClient(
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
