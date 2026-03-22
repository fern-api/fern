package example

import (
    context "context"
    client "github.com/api-wide-base-path/fern/client"
    option "github.com/api-wide-base-path/fern/option"
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
        1,
        "resourceParam",
    )
}
