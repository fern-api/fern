package example

import (
    context "context"

    client "github.com/php-global-header-env/fern/client"
    option "github.com/php-global-header-env/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.GetWithAPIVersion(
        context.TODO(),
    )
}
