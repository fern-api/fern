package example

import (
    context "context"

    fern "github.com/request-parameters/fern"
    client "github.com/request-parameters/fern/client"
    option "github.com/request-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateUsernameBodyOptionalProperties{}
    client.User.Createusernameoptional(
        context.TODO(),
        request,
    )
}
