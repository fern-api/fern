package example

import (
    context "context"

    fern "github.com/discriminated-union-with-nested-oneof/fern"
    client "github.com/discriminated-union-with-nested-oneof/fern/client"
    option "github.com/discriminated-union-with-nested-oneof/fern/option"
)

func do() {
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
    client.CreateAst(
        context.TODO(),
        request,
    )
}
