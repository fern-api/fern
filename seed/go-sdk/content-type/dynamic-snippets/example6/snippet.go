package example

import (
    context "context"

    fern "github.com/content-type/fern"
    client "github.com/content-type/fern/client"
    option "github.com/content-type/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ServiceOptionalMergePatchTestRequest{
        RequiredField: "requiredField",
    }
    client.Service.Optionalmergepatchtest(
        context.TODO(),
        request,
    )
}
