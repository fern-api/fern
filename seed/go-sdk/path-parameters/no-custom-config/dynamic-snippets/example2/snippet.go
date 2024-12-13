package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
    fern "github.com/path-parameters/fern"
)

func do() () {
    client := client.NewClient()
    client.Organizations.SearchOrganizations(
        context.TODO(),
        "tenantId",
        "organizationId",
        &fern.SearchOrganizationsRequest{
            Limit: fern.Int(
                1,
            ),
        },
    )
}
