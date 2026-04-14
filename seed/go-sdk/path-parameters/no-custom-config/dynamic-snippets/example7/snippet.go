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
    request := &fern.GetUserMetadataRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
    }
    client.User.GetUserMetadata(
        context.TODO(),
        request,
    )
}
