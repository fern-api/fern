using SeedOauthClientCredentialsWithVariables.Core;

namespace SeedOauthClientCredentialsWithVariables;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    private async Task<RawResponse> PostAsyncCore(
        string endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers =
            await new SeedOauthClientCredentialsWithVariables.Core.HeadersBuilder.Builder()
                .Add(_client.Options.Headers)
                .Add(_client.Options.AdditionalHeaders)
                .Add(options?.AdditionalHeaders)
                .BuildAsync()
                .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/service/{0}",
                        ValueConvert.ToPathParameterString(endpointParam)
                    ),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return new RawResponse()
            {
                StatusCode = response.Raw.StatusCode,
                Url = response.Raw.RequestMessage?.RequestUri ?? new Uri("about:blank"),
                Headers = ResponseHeaders.FromHttpResponseMessage(response.Raw),
            };
        }
        {
            var responseBody = await response
                .Raw.Content.ReadAsStringAsync(cancellationToken)
                .ConfigureAwait(false);
            throw new SeedOauthClientCredentialsWithVariablesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Service.PostAsync("endpointParam");
    /// </code></example>
    public WithRawResponseTask PostAsync(
        string endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask(PostAsyncCore(endpointParam, options, cancellationToken));
    }
}
