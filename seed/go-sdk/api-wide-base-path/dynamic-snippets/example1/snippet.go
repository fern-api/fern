package example

import (
    context "context"

    fern "github.com/api-wide-base-path/fern"
    client "github.com/api-wide-base-path/fern/client"
    option "github.com/api-wide-base-path/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServicePostRequest{
        PathParam: "pathParam",
        ServiceParam: "serviceParam",
        EndpointParam: 1,
        ResourceParam: "resourceParam",
    }
    client.Service.Post(
        context.TODO(),
        request,
    )
}
