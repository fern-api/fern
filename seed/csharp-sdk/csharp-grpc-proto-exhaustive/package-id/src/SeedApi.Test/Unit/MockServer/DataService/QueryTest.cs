using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class QueryTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        DataServiceStub.OnQuery(_ => new Data.V1.Grpc.QueryResponse());

        await Client.DataService.QueryAsync(new SeedApi.QueryRequest { TopK = 1 });
    }
}
