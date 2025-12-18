package example

import (
    client "github.com/go-string-request-body/fern/client"
    option "github.com/go-string-request-body/fern/option"
    fern "github.com/go-string-request-body/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.DidCommMessageRecvRequest{
        TenantId: "tenant_id",
        Body: "string",
    }
    client.DidCommMessageRecv(
        context.TODO(),
        request,
    )
}
