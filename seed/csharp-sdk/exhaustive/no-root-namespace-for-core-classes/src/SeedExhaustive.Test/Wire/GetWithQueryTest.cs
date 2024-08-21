using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Endpoints;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithQueryTest : BaseWireTest
{
    [Test]
    public void WireTest() {


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/params").WithParam("query", "string").WithParam("number", "1").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrowAsync(async () => await Client.Endpoints.Params.GetWithQueryAsync(new GetWithQuerynew GetWithQuery{ 
                Query = "string", Number = 1
            }, RequestOptions));}

}
