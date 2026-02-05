package example

import (
    client "github.com/nullable-allof-extends/fern/client"
    option "github.com/nullable-allof-extends/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.GetTest(
        context.TODO(),
    )
}
