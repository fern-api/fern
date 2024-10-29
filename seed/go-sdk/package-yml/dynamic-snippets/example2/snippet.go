package example

import (
    client "github.com/package-yml/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.Nop(
        context.TODO(),
        "id-a2ijs82",
        "id-219xca8",
    )
}
