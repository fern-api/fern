package example

import (
    client "github.com/api-wide-base-path/fern/client"
    option "github.com/api-wide-base-path/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Post(
        context.TODO(),
        "pathParam",
        "serviceParam",
        "resourceParam",
        1,
    )
}
