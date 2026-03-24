package example

import (
    context "context"
    client "github.com/examples/fern/pleaseinhere/client"
    option "github.com/examples/fern/pleaseinhere/option"
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
    request := "Hello world!\\n\\nwith\\n\\tnewlines"
    client.Echo(
        context.TODO(),
        request,
    )
}
