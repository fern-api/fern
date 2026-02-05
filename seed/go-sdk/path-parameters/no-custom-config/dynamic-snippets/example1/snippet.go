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
    request := &fern.GetOrganizationUserRequest{
        TenantId: "tenant_id",
        OrganizationId: "organization_id",
        UserId: "user_id",
    }
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        request,
    )
}
