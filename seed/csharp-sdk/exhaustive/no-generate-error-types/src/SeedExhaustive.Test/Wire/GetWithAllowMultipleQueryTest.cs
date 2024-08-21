using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive.Endpoints;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithAllowMultipleQueryTest : BaseWireTest
{
    [Test]
    public void WireTest() {


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/params").WithParam("query", "string").WithParam("numer", "1").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrowAsync(async () => await Client.Endpoints.Params.GetWithAllowMultipleQueryAsync(new GetWithMultipleQuerynew GetWithMultipleQuery{ 
                Query = ["string"], Numer = [1]
            }, RequestOptions));}

}
