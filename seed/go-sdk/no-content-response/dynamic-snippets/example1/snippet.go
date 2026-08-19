package example

import (
    context "context"

    fern "github.com/no-content-response/fern"
    client "github.com/no-content-response/fern/client"
    option "github.com/no-content-response/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateContactRequest{
        Name: "name",
        Email: fern.String(
            "email",
        ),
    }
    client.Contacts.Create(
        context.TODO(),
        request,
    )
}
