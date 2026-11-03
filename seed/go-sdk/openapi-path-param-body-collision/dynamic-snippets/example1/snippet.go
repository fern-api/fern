package example

import (
    context "context"

    fern "github.com/openapi-path-param-body-collision/fern"
    client "github.com/openapi-path-param-body-collision/fern/client"
    option "github.com/openapi-path-param-body-collision/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.IdentifierUpdate{
        ProfileID: "profileId",
        IDTypePathParam: "idTypePathParam",
        IDType: "idType",
        OldValue: "oldValue",
        NewValue: "newValue",
    }
    _, err := client.UpdateProfileIdentifier(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
