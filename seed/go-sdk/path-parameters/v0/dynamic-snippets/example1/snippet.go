package example

import (
    context "context"

    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Organizations.GetOrganizationUser(
        context.TODO(),
        "tenant_id",
        "organization_id",
        "user_id",
    )
}
