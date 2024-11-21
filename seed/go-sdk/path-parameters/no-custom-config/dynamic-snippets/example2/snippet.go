package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
    fern "github.com/path-parameters/fern"
)

func do() () {
    client := client.NewClient()
    client.User.GetOrganizationUser(
        context.TODO(),
        "organizationId",
        "userId",
        &fern.GetOrganizationUserRequest{},
    )
}
