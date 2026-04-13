package example

import (
    context "context"

    fern "github.com/go-deterministic-ordering/fern"
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := map[string]*fern.TypesObjectWithRequiredField{
        "key": &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
    client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObject(
        context.TODO(),
        request,
    )
}
