package example

import (
    client "github.com/cross-package-type-names/fern/client"
    option "github.com/cross-package-type-names/fern/option"
    context "context"
    fern "github.com/cross-package-type-names/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
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
