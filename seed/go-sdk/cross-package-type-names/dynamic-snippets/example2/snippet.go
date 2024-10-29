package example

import (
    client "github.com/cross-package-type-names/fern/client"
    context "context"
    fern "github.com/cross-package-type-names/fern"
)

func do() () {
    client := client.NewClient()
    client.Foo.Find(
        context.TODO(),
        &fern.FindRequest{
            OptionalString: fern.String(
                "optionalString",
            ),
            PublicProperty: fern.String(
                "publicProperty",
            ),
            PrivateProperty: fern.Int(
                1,
            ),
        },
    )
}
