using global::System.Text.Json;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public partial class BigunionClient : IBigunionClient
{
    private readonly RawClient _client;

    internal BigunionClient(RawClient client)
    {
        _client = client;
    }

    private async Task<
        WithRawResponse<
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
        >
    > GetAsyncCore(
        BigunionGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Get,
                    Path = string.Format(
                        "bigunion/{0}",
                        ValueConvert.ToPathParameterString(request.Id)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<
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
                >(responseBody)!;
                return new WithRawResponse<
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
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<bool>> UpdateAsyncCore(
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
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethodExtensions.Patch,
                    Path = "bigunion",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<bool>(responseBody)!;
                return new WithRawResponse<bool>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    private async Task<WithRawResponse<Dictionary<string, bool>>> UpdateManyAsyncCore(
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
    )
    {
        var _headers = await new SeedApi.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethodExtensions.Patch,
                    Path = "bigunion/many",
                    Body = request,
                    Headers = _headers,
                    ContentType = "application/json",
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            try
            {
                var responseData = JsonUtils.Deserialize<Dictionary<string, bool>>(responseBody)!;
                return new WithRawResponse<Dictionary<string, bool>>()
                {
                    Data = responseData,
                    RawResponse = new RawResponse()
                    {
                        StatusCode = response.Raw.StatusCode,
                        Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                        Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                    },
                };
            }
            catch (JsonException e)
            {
                throw new SeedApiApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Bigunion.GetAsync(new BigunionGetRequest { Id = "id" });
    /// </code></example>
    public WithRawResponseTask<
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
    )
    {
        return new WithRawResponseTask<
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
        >(GetAsyncCore(request, options, cancellationToken));
    }

    /// <example><code>
    /// await client.Bigunion.UpdateAsync(
    ///     new BigUnionZero { Value = "value", Type = BigUnionZeroType.NormalSweet }
    /// );
    /// </code></example>
    public WithRawResponseTask<bool> UpdateAsync(
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
    )
    {
        return new WithRawResponseTask<bool>(UpdateAsyncCore(request, options, cancellationToken));
    }

    /// <example><code>
    /// await client.Bigunion.UpdateManyAsync(
    ///     new List&lt;
    ///         OneOf&lt;
    ///             BigUnionZero,
    ///             BigUnionOne,
    ///             BigUnionTwo,
    ///             BigUnionThree,
    ///             BigUnionFour,
    ///             BigUnionFive,
    ///             BigUnionSix,
    ///             BigUnionSeven,
    ///             BigUnionEight,
    ///             BigUnionNine,
    ///             BigUnionTen,
    ///             BigUnionEleven,
    ///             BigUnionTwelve,
    ///             BigUnionThirteen,
    ///             BigUnionFourteen,
    ///             BigUnionFifteen,
    ///             BigUnionSixteen,
    ///             BigUnionSeventeen,
    ///             BigUnionEighteen,
    ///             BigUnionNineteen,
    ///             BigUnionTwenty,
    ///             BigUnionTwentyOne,
    ///             BigUnionTwentyTwo,
    ///             BigUnionTwentyThree,
    ///             BigUnionTwentyFour,
    ///             BigUnionTwentyFive,
    ///             BigUnionTwentySix,
    ///             BigUnionTwentySeven,
    ///             BigUnionTwentyEight
    ///         &gt;
    ///     &gt;()
    ///     {
    ///         new BigUnionZero { Value = "value", Type = BigUnionZeroType.NormalSweet },
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<Dictionary<string, bool>> UpdateManyAsync(
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
    )
    {
        return new WithRawResponseTask<Dictionary<string, bool>>(
            UpdateManyAsyncCore(request, options, cancellationToken)
        );
    }
}
