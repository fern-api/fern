package example

import (
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Reference.Send(
        context.TODO(),
        &fern.SendRequest{
            Query: "query",
            ContainerObject: &fern.ContainerObject{
                NestedObjects: []*fern.NestedObjectWithLiterals{
                    &fern.NestedObjectWithLiterals{
                        StrProp: "strProp",
                    },
                    &fern.NestedObjectWithLiterals{
                        StrProp: "strProp",
                    },
                },
            },
        },
    )
}
