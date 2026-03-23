package example

import (
    context "context"
    fern "github.com/optional/fern"
    client "github.com/optional/fern/client"
    option "github.com/optional/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.DeployParams{
        UpdateDraft: fern.Bool(
            true,
        ),
    }
    client.Optional.SendOptionalNullableWithAllOptionalProperties(
        context.TODO(),
        "actionId",
        "id",
        request,
    )
}
