package example

import (
    context "context"

    fern "github.com/audiences/fern"
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.FindRequest{
        OptionalString: fern.String(
            "optionalString",
        ),
        PublicProperty: fern.String(
            "publicProperty",
        ),
        PrivateProperty: fern.Int(
            1,
        ),
    }
    client.Foo.Find(
        context.TODO(),
        request,
    )
}
