package example

import (
    context "context"

    client "github.com/response-property/fern/client"
    option "github.com/response-property/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := "string"
    _, err := client.Service.GetMovieDocs(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
