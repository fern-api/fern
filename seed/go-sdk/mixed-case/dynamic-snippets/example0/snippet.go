package example

import (
    client "github.com/mixed-case/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.GetResource(
        context.TODO(),
        "rsc-xyz",
    )
}
