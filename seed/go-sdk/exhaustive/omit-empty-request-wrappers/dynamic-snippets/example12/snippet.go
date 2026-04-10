package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := map[string]*fern.TypesMixedType{
        "key": &fern.TypesMixedType{
            Double: 1.1,
        },
    }
    client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(
        context.TODO(),
        request,
    )
}
