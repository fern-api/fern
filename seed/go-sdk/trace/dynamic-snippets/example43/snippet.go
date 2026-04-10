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
    request := &fern.ProblemGetDefaultStarterFilesRequest{
        InputParams: []*fern.VariableTypeAndName{
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    VariableTypeZero: &fern.VariableTypeZero{
                        Type: fern.VariableTypeZeroTypeIntegerType,
                    },
                },
                Name: "name",
            },
            &fern.VariableTypeAndName{
                VariableType: &fern.VariableType{
                    VariableTypeZero: &fern.VariableTypeZero{
                        Type: fern.VariableTypeZeroTypeIntegerType,
                    },
                },
                Name: "name",
            },
        },
        OutputType: &fern.VariableType{
            VariableTypeZero: &fern.VariableTypeZero{
                Type: fern.VariableTypeZeroTypeIntegerType,
            },
        },
        MethodName: "methodName",
    }
    client.Problem.Getdefaultstarterfiles(
        context.TODO(),
        request,
    )
}
