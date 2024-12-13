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
            TenantId: "tenantId",
            OrganizationId: "organizationId",
            UserId: "userId",
        },
    )
}
