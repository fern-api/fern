package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    path "github.com/fern-api/path-parameters-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.GetOrganizationUserRequest{
        TenantId: "tenant_id",
        OrganizationId: "organization_id",
        UserId: "user_id",
    }
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        request,
    )
}
