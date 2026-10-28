package example

import (
    context "context"

    client "github.com/schemaless-request-body-examples/fern/client"
    option "github.com/schemaless-request-body-examples/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := map[string]any{
        "care": map[string]any{
            "humidity": "high",
            "light": "full sun",
            "water": "distilled only",
        },
        "name": "Venus Flytrap",
        "species": "Dionaea muscipula",
        "tags": []any{
            "carnivorous",
            "tropical",
        },
    }
    _, err := client.CreatePlant(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
