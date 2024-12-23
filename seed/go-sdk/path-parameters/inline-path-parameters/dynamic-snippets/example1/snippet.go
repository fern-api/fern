package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        &path.GetOrganizationUserRequest{
            TenantId: "tenant_id",
            OrganizationId: "organization_id",
            UserId: "user_id",
        },
    )
}
