package example

import (
    context "context"

    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Organizations.GetOrganization(
        context.TODO(),
        "tenant_id",
        "organization_id",
    )
    if err != nil {
        return err
    }
    return nil
}
