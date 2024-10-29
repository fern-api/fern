package example

import (
    client "github.com/mixed-file-directory/fern/client"
    context "context"
    fern "github.com/mixed-file-directory/fern"
)

func do() () {
    client := client.NewClient()
    client.Organization.Create(
        context.TODO(),
        &fern.CreateOrganizationRequest{
            Name: "name",
        },
    )
}
