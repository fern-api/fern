package example

import (
    context "context"

    fern "github.com/variables/fern"
    client "github.com/variables/fern/client"
    option "github.com/variables/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServicePostRequest{
        EndpointParam: "endpointParam",
    }
    client.Service.Post(
        context.TODO(),
        request,
    )
}
