package example

import (
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
    fern "github.com/audiences/fern"
    context "context"
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
