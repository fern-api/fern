package example

import (
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
    fern "github.com/literal/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendRequest{
        Context: fern.SomeLiteral(
            "You're super wise",
        ),
        Query: "What is the weather today",
        ContainerObject: &fern.ContainerObject{
            NestedObjects: []*fern.NestedObjectWithLiterals{
                &fern.NestedObjectWithLiterals{
                    StrProp: "strProp",
                },
            },
        },
    }
    client.Reference.Send(
        context.TODO(),
        request,
    )
}
