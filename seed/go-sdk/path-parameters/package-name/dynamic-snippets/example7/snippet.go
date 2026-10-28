package example

import (
    context "context"

    path "github.com/fern-api/path-parameters-go"
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.GetUserMetadataRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Version: 1,
    }
    _, err := client.User.GetUserMetadata(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
