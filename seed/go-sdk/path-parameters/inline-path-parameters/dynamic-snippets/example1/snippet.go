package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        &path.GetOrganizationUserRequest{
            TenantId: "tenant_id",
            OrganizationId: "organization_id",
            UserId: "user_id",
        },
    )
}
