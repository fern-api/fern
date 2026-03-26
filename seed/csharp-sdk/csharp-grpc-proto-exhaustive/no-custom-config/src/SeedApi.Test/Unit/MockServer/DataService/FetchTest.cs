using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.DataService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FetchTest : BaseGrpcMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        DataServiceStub.OnFetch(_ => new Data.V1.Grpc.FetchResponse());

        await Client.DataService.FetchAsync(
            new SeedApi.FetchRequest { Ids = ["ids"], Namespace = "namespace" }
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        DataServiceStub.OnFetch(_ => new Data.V1.Grpc.FetchResponse());

        await Client.DataService.FetchAsync(new SeedApi.FetchRequest());
    }
}
