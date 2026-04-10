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
    request := &fern.TypesAnimal{
        TypesAnimalZero: &fern.TypesAnimalZero{
            Name: "name",
            LikesToWoof: true,
            Animal: fern.TypesAnimalZeroAnimalDog,
        },
    }
    client.EndpointsUnion.EndpointsUnionGetAndReturnUnion(
        context.TODO(),
        request,
    )
}
