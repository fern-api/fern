using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public partial class PutClient : IPutClient
{
    private RawClient _client;

    internal PutClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<PutResponse>> AddAsyncCore(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedExhaustive.Core.HeadersBuilder.Builder()
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
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            try
            {
                var responseData = JsonUtils.Deserialize<PutResponse>(responseBody)!;
                return new WithRawResponse<PutResponse>()
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
                throw new SeedExhaustiveApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExhaustiveApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.Endpoints.Put.AddAsync(new PutRequest { Id = "id" });
    /// </code></example>
    public WithRawResponseTask<PutResponse> AddAsync(
        PutRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<PutResponse>(
            AddAsyncCore(request, options, cancellationToken)
        );
    }
}
