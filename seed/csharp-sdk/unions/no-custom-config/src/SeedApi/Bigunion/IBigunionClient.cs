using OneOf;

namespace SeedApi;

public partial interface IBigunionClient
{
    WithRawResponseTask<
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
    > GetAsync(
        BigunionGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<bool> UpdateAsync(
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
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Dictionary<string, bool>> UpdateManyAsync(
        IEnumerable<
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
        > request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
