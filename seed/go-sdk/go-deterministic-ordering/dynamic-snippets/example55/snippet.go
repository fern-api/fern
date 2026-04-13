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
    request := &fern.TypesObjectWithMapOfMap{
        Map: map[string]map[string]string{
            "map": map[string]string{
                "map": "map",
            },
        },
    }
    client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMap(
        context.TODO(),
        request,
    )
}
