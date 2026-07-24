package example

import (
    context "context"

    fern "github.com/openapi-path-param-body-collision/fern"
    client "github.com/openapi-path-param-body-collision/fern/client"
    option "github.com/openapi-path-param-body-collision/fern/option"
)

func do() {
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
    client.UpdateProfileIdentifier(
        context.TODO(),
        request,
    )
}
