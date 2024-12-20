package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.Organizations.DeleteOrganization(
        context.TODO(),
        "tenant_id",
        "organization_id",
        &path.DeleteOrganizationRequest{
            Limit: path.Int(
                1,
            ),
            Soft: path.Bool(
                true,
            ),
        },
    )
}
