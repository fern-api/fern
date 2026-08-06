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
        ProfileID: "profile_123",
        IDTypePathParam: "email",
        IDType: "phone",
        OldValue: "+13175556789",
        NewValue: "+13175556798",
    }
    client.UpdateProfileIdentifier(
        context.TODO(),
        request,
    )
}
