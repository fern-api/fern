package example

import (
    context "context"

    fern "github.com/undiscriminated-unions/fern"
    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.MetadataUnion{
        OptionalMetadataOptional: map[string]any{
            "key": "value",
        },
    }
    client.Union.Updatemetadata(
        context.TODO(),
        request,
    )
}
