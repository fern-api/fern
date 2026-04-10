package example

import (
    context "context"

    fern "github.com/multi-url-environment/fern"
    client "github.com/multi-url-environment/fern/client"
    option "github.com/multi-url-environment/fern/option"
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
    request := &fern.BootInstanceRequest{
        Size: "size",
    }
    client.Ec2.BootInstance(
        context.TODO(),
        request,
    )
}
