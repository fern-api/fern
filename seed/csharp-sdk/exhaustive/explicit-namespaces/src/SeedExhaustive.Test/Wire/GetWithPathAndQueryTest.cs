using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Endpoints.Params;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithPathAndQueryTest : BaseWireTest
{
    [Test]
    public void WireTest() {


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/params/path-query/string").WithParam("query", "string").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrowAsync(async () => await Client.Endpoints.Params.GetWithPathAndQueryAsync("string", new GetWithPathAndQuerynew GetWithPathAndQuery{ 
                Query = "string"
            }, RequestOptions));}

}
