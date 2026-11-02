package example

import (
    context "context"

    fern "github.com/no-content-response/fern"
    client "github.com/no-content-response/fern/client"
    option "github.com/no-content-response/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateContactRequest{
        Name: "name",
    }
    _, err := client.Contacts.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
