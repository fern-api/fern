using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        DataServiceStub.OnUpdate(_ => new Data.V1.Grpc.UpdateResponse());

        await Client.DataService.UpdateAsync(
            new SeedApi.UpdateRequest { Id = "id" }
        );
    }
}
