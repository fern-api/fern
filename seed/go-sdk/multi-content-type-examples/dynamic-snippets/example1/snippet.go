package example

import (
    context "context"

    fern "github.com/multi-content-type-examples/fern"
    client "github.com/multi-content-type-examples/fern/client"
    option "github.com/multi-content-type-examples/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ClientRequest{
        Client: &fern.Client{
            Name: "name",
            Email: "email",
        },
    }
    _, err := client.Clients.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
