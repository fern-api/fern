package example

import (
    context "context"

    path "github.com/fern-api/path-parameters-go"
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.OrganizationsGetOrganizationRequest{
        TenantID: "tenant_id",
        OrganizationID: "organization_id",
    }
    client.Organizations.Getorganization(
        context.TODO(),
        request,
    )
}
