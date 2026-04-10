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
    request := &fern.TypesObjectWithMapOfMap{
        Map: map[string]map[string]string{
            "key": map[string]string{
                "key": "value",
            },
        },
    }
    client.EndpointsObject.EndpointsObjectGetAndReturnWithMapOfMap(
        context.TODO(),
        request,
    )
}
