package example

import (
    client "github.com/multi-url-environment/fern/client"
    option "github.com/multi-url-environment/fern/option"
    context "context"
    fern "github.com/multi-url-environment/fern"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Ec2.BootInstance(
        context.TODO(),
        &fern.BootInstanceRequest{
            Size: "size",
        },
    )
}
