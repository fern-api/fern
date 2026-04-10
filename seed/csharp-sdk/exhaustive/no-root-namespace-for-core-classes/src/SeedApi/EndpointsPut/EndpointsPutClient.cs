using global::System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public partial class EndpointsPutClient : IEndpointsPutClient
{
    private readonly RawClient _client;

    internal EndpointsPutClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<EndpointsPutResponse>> EndpointsPutAddAsyncCore(
        EndpointsPutAddRequest request,
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
                    Method = HttpMethod.Put,
                    Path = string.Format("{0}", ValueConvert.ToPathParameterString(request.Id)),
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
                var responseData = JsonUtils.Deserialize<EndpointsPutResponse>(responseBody)!;
                return new WithRawResponse<EndpointsPutResponse>()
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
    /// await client.EndpointsPut.EndpointsPutAddAsync(new EndpointsPutAddRequest { Id = "id" });
    /// </code></example>
    public WithRawResponseTask<EndpointsPutResponse> EndpointsPutAddAsync(
        EndpointsPutAddRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<EndpointsPutResponse>(
            EndpointsPutAddAsyncCore(request, options, cancellationToken)
        );
    }
}
