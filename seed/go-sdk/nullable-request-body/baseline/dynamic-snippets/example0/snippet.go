package example

import (
    context "context"

    fern "github.com/nullable-request-body/fern"
    client "github.com/nullable-request-body/fern/client"
    option "github.com/nullable-request-body/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TestMethodNameTestGroupRequest{
        PathParam: "path_param",
        Body: &fern.PlainObject{},
    }
    client.TestGroup.TestMethodName(
        context.TODO(),
        request,
    )
}
