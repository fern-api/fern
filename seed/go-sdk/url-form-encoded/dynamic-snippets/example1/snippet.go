package example

import (
    context "context"

    fern "github.com/url-form-encoded/fern"
    client "github.com/url-form-encoded/fern/client"
    option "github.com/url-form-encoded/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SubmitFormDataRequest{
        Username: "username",
        Email: "email",
    }
    client.SubmitFormData(
        context.TODO(),
        request,
    )
}
