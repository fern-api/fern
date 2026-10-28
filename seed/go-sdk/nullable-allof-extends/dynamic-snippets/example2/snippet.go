package example

import (
    context "context"

    fern "github.com/nullable-allof-extends/fern"
    client "github.com/nullable-allof-extends/fern/client"
    option "github.com/nullable-allof-extends/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.RootObject{}
    _, err := client.CreateTest(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
