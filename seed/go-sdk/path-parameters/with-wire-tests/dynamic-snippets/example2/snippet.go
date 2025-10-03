package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    fern "github.com/path-parameters/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchOrganizationsRequest{
        Limit: fern.Int(
            1,
        ),
    }
    client.Organizations.SearchOrganizations(
        context.TODO(),
        "tenant_id",
        "organization_id",
        request,
    )
}
