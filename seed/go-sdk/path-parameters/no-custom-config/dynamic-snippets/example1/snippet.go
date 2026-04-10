package example

import (
    context "context"

    fern "github.com/path-parameters/fern"
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetOrganizationUserRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
        UserID: "user_id",
    }
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        request,
    )
}
