package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    context "context"
    pathparametersgo "github.com/fern-api/path-parameters-go"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Organizations.SearchOrganizations(
        context.TODO(),
        "tenant_id",
        "organization_id",
        &pathparametersgo.SearchOrganizationsRequest{
            Limit: pathparametersgo.Int(
                1,
            ),
        },
    )
}
