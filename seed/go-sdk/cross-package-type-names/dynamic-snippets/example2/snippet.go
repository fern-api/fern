package example

import (
    client "github.com/cross-package-type-names/fern/client"
    option "github.com/cross-package-type-names/fern/option"
    fern "github.com/cross-package-type-names/fern"
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
