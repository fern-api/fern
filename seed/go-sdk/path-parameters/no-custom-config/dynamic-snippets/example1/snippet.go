package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        "tenant_id",
        "organization_id",
        "user_id",
    )
}
