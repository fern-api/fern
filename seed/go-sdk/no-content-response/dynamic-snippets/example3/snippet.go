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
    request := &fern.GetContactsRequest{
        Id: "id",
    }
    client.Contacts.Get(
        context.TODO(),
        request,
    )
}
