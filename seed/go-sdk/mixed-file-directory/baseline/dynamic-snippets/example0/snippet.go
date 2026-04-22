package example

import (
    context "context"

    fern "github.com/mixed-file-directory/fern"
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateOrganizationRequest{
        Name: "name",
    }
    client.Organization.Create(
        context.TODO(),
        request,
    )
}
