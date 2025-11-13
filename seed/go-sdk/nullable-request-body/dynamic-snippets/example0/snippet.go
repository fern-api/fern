package example

import (
    client "github.com/nullable-request-body/fern/client"
    option "github.com/nullable-request-body/fern/option"
    fern "github.com/nullable-request-body/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TestGroupTestMethodNameRequest{
        QueryParamInteger: fern.Int(
            1,
        ),
        Body: &fern.PlainObject{},
    }
    client.TestGroup.TestMethodName(
        context.TODO(),
        "path_param",
        request,
    )
}
