package example

import (
    context "context"
    strings "strings"

    fern "github.com/openapi-request-body-ref/fern"
    client "github.com/openapi-request-body-ref/fern/client"
    option "github.com/openapi-request-body-ref/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateCatalogImageBody{
        ImageFile: strings.NewReader(
            "",
        ),
        Request: &fern.CreateCatalogImageRequest{
            CatalogObjectID: "catalog_object_id",
        },
    }
    _, err := client.Catalog.CreateCatalogImage(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
