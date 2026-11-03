package example

import (
    context "context"

    fern "github.com/url-form-encoded/fern"
    client "github.com/url-form-encoded/fern/client"
    option "github.com/url-form-encoded/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PostSubmitRequest{
        Username: "username",
        Email: "email",
        Content: "Content",
    }
    _, err := client.SubmitFormData(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
