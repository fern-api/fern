package example

import (
    context "context"

    fern "github.com/schemaless-request-body-examples/fern"
    client "github.com/schemaless-request-body-examples/fern/client"
    option "github.com/schemaless-request-body-examples/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreatePlantWithSchemaRequest{
        Name: fern.String(
            "Sundew",
        ),
        Species: fern.String(
            "Drosera capensis",
        ),
    }
    client.CreatePlantWithSchema(
        context.TODO(),
        request,
    )
}
