package example

import (
    context "context"

    fern "github.com/literal/fern"
    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SendRequest{
        Query: "query",
        Context: fern.SomeLiteral(
            "You're super wise",
        ),
        MaybeContext: fern.String(
            "You're super wise",
        ),
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
    }
    _, err := client.Reference.Send(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
