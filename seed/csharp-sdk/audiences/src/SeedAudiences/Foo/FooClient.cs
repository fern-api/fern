using System.Text.Json;
using SeedAudiences.Core;

namespace SeedAudiences;

public partial class FooClient : IFooClient
{
    private RawClient _client;

    internal FooClient(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public FooClient.WithRawResponseClient Raw { get; }

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
    public async Task<ImportingType> FindAsync(
        FindRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.FindAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<ImportingType>> FindAsync(
            FindRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var _query = new Dictionary<string, object>();
            if (request.OptionalString != null)
            {
                _query["optionalString"] = request.OptionalString;
            }
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = "",
                        Body = request,
                        Query = _query,
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
                    var data = JsonUtils.Deserialize<ImportingType>(responseBody)!;
                    return new WithRawResponse<ImportingType>
                    {
                        Data = data,
                        RawResponse = new RawResponse
                        {
                            StatusCode = (global::System.Net.HttpStatusCode)response.StatusCode,
                            Url = response.Raw.RequestMessage?.RequestUri!,
                            Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
                        },
                    };
                }
                catch (JsonException e)
                {
                    throw new SeedAudiencesException("Failed to deserialize response", e);
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
    }
}
