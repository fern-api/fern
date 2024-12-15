package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.User.GetOrganization(
        context.TODO(),
        "organizationId",
    )
}
