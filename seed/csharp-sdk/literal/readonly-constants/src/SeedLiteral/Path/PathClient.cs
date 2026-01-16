using System.Text.Json;
using SeedLiteral.Core;

namespace SeedLiteral;

public partial class PathClient : IPathClient
{
    private RawClient _client;

    internal PathClient(RawClient client)
    {
        _client = client;
        Raw = new RawAccessClient(_client);
    }

    public PathClient.RawAccessClient Raw { get; }

    /// <example><code>
    /// await client.Path.SendAsync("123");
    /// </code></example>
    public async Task<SendResponse> SendAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.SendAsync(id, options, cancellationToken);
        return response.Data;
    }

    public partial class RawAccessClient
    {
        private readonly RawClient _client;

        internal RawAccessClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<SendResponse>> SendAsync(
            string id,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.BaseUrl,
                        Method = HttpMethod.Post,
                        Path = string.Format("path/{0}", ValueConvert.ToPathParameterString(id)),
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
                    var data = JsonUtils.Deserialize<SendResponse>(responseBody)!;
                    return new WithRawResponse<SendResponse>
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
                    throw new SeedLiteralException("Failed to deserialize response", e);
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedLiteralApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
