using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        DataServiceStub.OnCreate(_ => new Data.V1.Grpc.CreateResponse());

        await Client.DataService.CreateAsync(
            new SeedApi.CreateRequest { Name = "name" }
        );
    }
}
