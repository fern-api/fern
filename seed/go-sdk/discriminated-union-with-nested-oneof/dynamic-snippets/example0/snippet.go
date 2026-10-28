package example

import (
    context "context"

    fern "github.com/discriminated-union-with-nested-oneof/fern"
    client "github.com/discriminated-union-with-nested-oneof/fern/client"
    option "github.com/discriminated-union-with-nested-oneof/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.AstNode{
        Llm: &fern.AstNodeLlm{
            Model: "model",
        },
    }
    _, err := client.CreateAst(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
