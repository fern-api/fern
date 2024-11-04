package example

import (
    client "github.com/literal/fern/client"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient()
    client.Reference.Send(
        context.TODO(),
        &fern.SendRequest{
            Query: "What is the weather today",
            ContainerObject: &fern.ContainerObject{
                NestedObjects: []*fern.NestedObjectWithLiterals{
                    &fern.NestedObjectWithLiterals{
                        StrProp: "strProp",
                    },
                },
            },
        },
    )
}
