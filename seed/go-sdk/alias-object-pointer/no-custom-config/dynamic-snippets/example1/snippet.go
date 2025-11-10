package example

import (
    client "github.com/alias-object-pointer/fern/client"
    option "github.com/alias-object-pointer/fern/option"
    fern "github.com/alias-object-pointer/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateRequest{
        MapField: func() *fern.StringMap { v := fern.StringMap(
            map[string]string{
                "mapField": "mapField",
            },
        ); return &v }(),
        ListField: func() *fern.StringList { v := fern.StringList(
            []string{
                "listField",
                "listField",
            },
        ); return &v }(),
    }
    client.Create(
        context.TODO(),
        request,
    )
}
