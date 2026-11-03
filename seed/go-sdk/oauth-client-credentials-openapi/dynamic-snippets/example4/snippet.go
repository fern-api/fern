package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-openapi/fern"
    client "github.com/oauth-client-credentials-openapi/fern/client"
    option "github.com/oauth-client-credentials-openapi/fern/option"
)

func do() error {
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
    _, err := client.Plants.Get(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
