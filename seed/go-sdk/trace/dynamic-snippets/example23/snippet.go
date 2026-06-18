package example

import (
    context "context"

    fern "github.com/trace/fern"
    client "github.com/trace/fern/client"
    common "github.com/trace/fern/common"
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
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &common.VariableType{
                    IntegerType: "integerType",
                },
                Name: "name",
            },
        },
        OutputType: &common.VariableType{
            IntegerType: "integerType",
        },
        MethodName: "methodName",
    }
    client.Problem.GetDefaultStarterFiles(
        context.TODO(),
        request,
    )
}
