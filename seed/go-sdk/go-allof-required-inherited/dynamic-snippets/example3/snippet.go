package example

import (
    context "context"

    fern "github.com/go-allof-required-inherited/fern"
    client "github.com/go-allof-required-inherited/fern/client"
    option "github.com/go-allof-required-inherited/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.PlantCreate{
        Nickname: fern.String(
            "nickname",
        ),
        Species: "species",
        LegacyTag: fern.String(
            "legacy_tag",
        ),
    }
    client.CreatePlant(
        context.TODO(),
        request,
    )
}
