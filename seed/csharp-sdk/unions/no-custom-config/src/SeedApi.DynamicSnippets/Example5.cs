using SeedApi;
using OneOf;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateManyAsync(
            new List<OneOf<BigUnionZero, BigUnionOne, BigUnionTwo, BigUnionThree, BigUnionFour, BigUnionFive, BigUnionSix, BigUnionSeven, BigUnionEight, BigUnionNine, BigUnionTen, BigUnionEleven, BigUnionTwelve, BigUnionThirteen, BigUnionFourteen, BigUnionFifteen, BigUnionSixteen, BigUnionSeventeen, BigUnionEighteen, BigUnionNineteen, BigUnionTwenty, BigUnionTwentyOne, BigUnionTwentyTwo, BigUnionTwentyThree, BigUnionTwentyFour, BigUnionTwentyFive, BigUnionTwentySix, BigUnionTwentySeven, BigUnionTwentyEight>>(){
                new BigUnionZero {
                    Type = BigUnionZeroType.NormalSweet,
                    Value = "value"
                },
                new BigUnionZero {
                    Type = BigUnionZeroType.NormalSweet,
                    Value = "value"
                },
            }
        );
    }

}
