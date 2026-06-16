package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    option "github.com/trace/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetDefaultStarterFilesRequest{
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &fern.VariableType{
            IntegerType: "integerType",
        },
        MethodName: "methodName",
    }
    client.Problem.GetDefaultStarterFiles(
        context.TODO(),
        request,
    )
}
