using global::System.Threading.Tasks;
using SeedTrace;
using SeedTrace.Core;

namespace Usage;

public class Example33
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.Problem.GetLatestProblemAsync(
            "problemId"
        );
    }

}
