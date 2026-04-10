using NUnit.Framework;
using OneOf;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Bigunion;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateManyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            [
              {
                "type": "normalSweet",
                "value": "value"
              },
              {
                "type": "normalSweet",
                "value": "value"
              }
            ]
            """;

        const string mockResponse = """
            {
              "string": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/bigunion/many")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Bigunion.UpdateManyAsync(
            new List<
                OneOf<
                    BigUnionZero,
                    BigUnionOne,
                    BigUnionTwo,
                    BigUnionThree,
                    BigUnionFour,
                    BigUnionFive,
                    BigUnionSix,
                    BigUnionSeven,
                    BigUnionEight,
                    BigUnionNine,
                    BigUnionTen,
                    BigUnionEleven,
                    BigUnionTwelve,
                    BigUnionThirteen,
                    BigUnionFourteen,
                    BigUnionFifteen,
                    BigUnionSixteen,
                    BigUnionSeventeen,
                    BigUnionEighteen,
                    BigUnionNineteen,
                    BigUnionTwenty,
                    BigUnionTwentyOne,
                    BigUnionTwentyTwo,
                    BigUnionTwentyThree,
                    BigUnionTwentyFour,
                    BigUnionTwentyFive,
                    BigUnionTwentySix,
                    BigUnionTwentySeven,
                    BigUnionTwentyEight
                >
            >()
            {
                new BigUnionZero { Type = BigUnionZeroType.NormalSweet, Value = "value" },
                new BigUnionZero { Type = BigUnionZeroType.NormalSweet, Value = "value" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            [
              {
                "value": "value",
                "type": "normalSweet"
              }
            ]
            """;

        const string mockResponse = """
            {
              "key": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/bigunion/many")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Bigunion.UpdateManyAsync(
            new List<
                OneOf<
                    BigUnionZero,
                    BigUnionOne,
                    BigUnionTwo,
                    BigUnionThree,
                    BigUnionFour,
                    BigUnionFive,
                    BigUnionSix,
                    BigUnionSeven,
                    BigUnionEight,
                    BigUnionNine,
                    BigUnionTen,
                    BigUnionEleven,
                    BigUnionTwelve,
                    BigUnionThirteen,
                    BigUnionFourteen,
                    BigUnionFifteen,
                    BigUnionSixteen,
                    BigUnionSeventeen,
                    BigUnionEighteen,
                    BigUnionNineteen,
                    BigUnionTwenty,
                    BigUnionTwentyOne,
                    BigUnionTwentyTwo,
                    BigUnionTwentyThree,
                    BigUnionTwentyFour,
                    BigUnionTwentyFive,
                    BigUnionTwentySix,
                    BigUnionTwentySeven,
                    BigUnionTwentyEight
                >
            >()
            {
                new BigUnionZero { Value = "value", Type = BigUnionZeroType.NormalSweet },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
