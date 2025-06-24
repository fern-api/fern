package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    context "context"
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
