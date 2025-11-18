package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    path "github.com/fern-api/path-parameters-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.GetUserMetadataRequest{
        TenantId: "tenant_id",
        UserId: "user_id",
        Version: 1,
    }
    client.User.GetUserMetadata(
        context.TODO(),
        request,
    )
}
