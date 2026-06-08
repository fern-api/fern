using global::System.Text.Json;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

public partial class BytesClient : IBytesClient
{
    private readonly RawClient _client;

    internal BytesClient(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<User>> UploadBytesAsyncCore(
        UploadBytesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpElidePathParameters.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new StreamRequest
                {
                    Method = HttpMethod.Post,
                    Path = string.Format(
                        "/bytes/{0}",
                        ValueConvert.ToPathParameterString(request.UploadId)
                    ),
                    Body = request.Body,
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
                var responseData = JsonUtils.Deserialize<User>(responseBody)!;
                return new WithRawResponse<User>()
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
                throw new SeedCsharpElidePathParametersApiException(
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
            throw new SeedCsharpElidePathParametersApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Endpoint with path parameter + bytes body. The wrapper should NOT be unwrapped because bytes bodies cannot be passed directly as a method parameter.
    /// </summary>
    public WithRawResponseTask<User> UploadBytesAsync(
        UploadBytesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<User>(
            UploadBytesAsyncCore(request, options, cancellationToken)
        );
    }
}
