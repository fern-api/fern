package example

import (
    context "context"

    fern "github.com/mixed-file-directory/fern"
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateOrganizationRequest{
        Name: "name",
    }
    _, err := client.Organization.Create(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
