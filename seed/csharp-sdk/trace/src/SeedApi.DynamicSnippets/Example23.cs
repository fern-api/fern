using SeedTrace;

namespace Usage;

public class Example23
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Problem.GetDefaultStarterFilesAsync(
            new GetDefaultStarterFilesRequest {
                InputParams = new List<VariableTypeAndName>(){
                    new VariableTypeAndName {
                        VariableType = new VariableType(
                            new VariableType.IntegerType()
                        ),
                        Name = "name"
                    },
                    new VariableTypeAndName {
                        VariableType = new VariableType(
                            new VariableType.IntegerType()
                        ),
                        Name = "name"
                    },
                }
                ,
                OutputType = new VariableType(
                    new VariableType.IntegerType()
                ),
                MethodName = "methodName"
            }
        );
    }

}
