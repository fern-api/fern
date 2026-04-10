using SeedApi.Core;

namespace SeedApi;

public partial class ServiceClient : IServiceClient
{
    private readonly RawClient _client;

    internal ServiceClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.Service.PostAsync(
    ///     new ServicePostRequest
    ///     {
    ///         PathParam = "pathParam",
    ///         ServiceParam = "serviceParam",
    ///         EndpointParam = 1,
    ///         ResourceParam = "resourceParam",
    ///     }
    /// );
    /// </code></example>
    public async Task PostAsync(
        ServicePostRequest request,
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
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "test/{0}/{1}/{2}/{3}",
                        ValueConvert.ToPathParameterString(request.PathParam),
                        ValueConvert.ToPathParameterString(request.ServiceParam),
                        ValueConvert.ToPathParameterString(request.EndpointParam),
                        ValueConvert.ToPathParameterString(request.ResourceParam)
                    ),
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
}
