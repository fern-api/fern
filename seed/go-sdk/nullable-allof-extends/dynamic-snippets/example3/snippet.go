package example

import (
    context "context"

    fern "github.com/nullable-allof-extends/fern"
    client "github.com/nullable-allof-extends/fern/client"
    option "github.com/nullable-allof-extends/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.RootObject{
        NormalField: fern.String(
            "normalField",
        ),
        NullableField: fern.String(
            "nullableField",
        ),
    }
    client.CreateTest(
        context.TODO(),
        request,
    )
}
