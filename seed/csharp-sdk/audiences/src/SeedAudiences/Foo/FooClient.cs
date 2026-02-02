using System.Text.Json;
using SeedAudiences.Core;

namespace SeedAudiences;

public partial class FooClient : IFooClient
{
    private RawClient _client;

    internal FooClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<ImportingType>> FindAsyncCore(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _queryString = new SeedAudiences.Core.QueryStringBuilder.Builder(capacity: 1)
            .Add("optionalString", request.OptionalString)
            .MergeAdditional(options?.AdditionalQueryParameters)
            .Build();
        var _headers = await new SeedAudiences.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
                    Body = request,
                    QueryString = _queryString,
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<ImportingType>(responseBody)!;
                return new WithRawResponse<ImportingType>()
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
                throw new SeedAudiencesApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedAudiencesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Foo.FindAsync(
    ///     new FindRequest
    ///     {
    ///         OptionalString = "optionalString",
    ///         PublicProperty = "publicProperty",
    ///         PrivateProperty = 1,
    ///     }
    /// );
    /// </code></example>
    public WithRawResponseTask<ImportingType> FindAsync(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<ImportingType>(
            FindAsyncCore(request, options, cancellationToken)
        );
    }
}
