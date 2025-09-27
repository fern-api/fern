package example

import (
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    fern "github.com/mixed-file-directory/fern"
    context "context"
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
