package example

import (
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    context "context"
    fern "github.com/mixed-file-directory/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Organization.Create(
        context.TODO(),
        &fern.CreateOrganizationRequest{
            Name: "name",
        },
    )
}
