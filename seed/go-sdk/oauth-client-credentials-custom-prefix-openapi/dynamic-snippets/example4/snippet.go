package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-custom-prefix-openapi/fern"
    client "github.com/oauth-client-credentials-custom-prefix-openapi/fern/client"
    option "github.com/oauth-client-credentials-custom-prefix-openapi/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    request := &fern.GetPlantsRequest{
        PlantID: "plantId",
    }
    client.Plants.Get(
        context.TODO(),
        request,
    )
}
