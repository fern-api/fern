using SeedApiWideBasePath.Core;

namespace SeedApiWideBasePath;

public partial class ServiceClient
{
    private RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.PostAsync("pathParam", "serviceParam", 1, "resourceParam");
    /// </code></example>
    public async Task PostAsync(
        string pathParam,
        string serviceParam,
        int endpointParam,
        string resourceParam,
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
                    Path = string.Format(
                        "/test/{0}/{1}/{2}/{3}",
                        ValueConvert.ToPathParameterString(pathParam),
                        ValueConvert.ToPathParameterString(serviceParam),
                        ValueConvert.ToPathParameterString(endpointParam),
                        ValueConvert.ToPathParameterString(resourceParam)
                    ),
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
            throw new SeedApiWideBasePathApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
