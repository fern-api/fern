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
    request := &path.SearchOrganizationsRequest{
        Limit: path.Int(
            1,
        ),
    }
    client.Organizations.SearchOrganizations(
        context.TODO(),
        "tenant_id",
        "organization_id",
        request,
    )
}
