package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Organizations.GetOrganization(
        context.TODO(),
        "tenant_id",
        "organization_id",
    )
}
