package example

import (
    context "context"

    client "github.com/plain-text/fern/client"
    option "github.com/plain-text/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Service.GetXML(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
