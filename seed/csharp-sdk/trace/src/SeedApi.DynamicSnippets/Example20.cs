using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example20
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Problem.GetDefaultStarterFilesAsync(
            new GetDefaultStarterFilesRequest{
                InputParams = new List<VariableTypeAndName>(){
                    new VariableTypeAndName{
                        VariableType = new VariableType(),
                        Name = "name"
                    },
                    new VariableTypeAndName{
                        VariableType = new VariableType(),
                        Name = "name"
                    },
                },
                OutputType = new VariableType(),
                MethodName = "methodName"
            }
        );
    }

}
