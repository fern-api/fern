package example

import (
    context "context"

    fern "github.com/literal/fern"
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.HeadersSendRequest{
        EndpointVersion: fern.HeadersSendRequestXEndpointVersionTwo122024,
        Async: true,
        Query: "query",
    }
    client.Headers.Send(
        context.TODO(),
        request,
    )
}
