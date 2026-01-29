using SeedVariables.Core;

namespace SeedVariables;

public partial class ServiceClient : IServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.PostAsync("endpointParam");
    /// </code></example>
    public async Task PostAsync(
        string endpointParam,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedVariables.Core.HeadersBuilder.Builder()
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
                    Path = string.Format("/{0}", ValueConvert.ToPathParameterString(endpointParam)),
                    Headers = _headers,
                    Options = options,
                },
                cancellationToken
            )
            .ConfigureAwait(false);
        if (response.StatusCode is >= 200 and < 400)
        {
            return;
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedVariablesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
