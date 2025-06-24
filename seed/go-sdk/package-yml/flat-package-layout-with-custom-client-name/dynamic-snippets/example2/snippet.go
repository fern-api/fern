package example

import (
    fern "github.com/package-yml/fern"
    option "github.com/package-yml/fern/option"
    context "context"
)

func do() {
    client := fern.New(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Service.Nop(
        context.TODO(),
        "id-a2ijs82",
        "id-219xca8",
    )
}
