using System.Text.Json;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class S3Client : IS3Client
{
    private RawClient _client;

    internal S3Client(RawClient client)
    {
        _client = client;
    }

    private async Task<WithRawResponse<string>> GetPresignedUrlAsyncCore(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedMultiUrlEnvironment.Core.HeadersBuilder.Builder()
            .Add(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.Environment.S3,
                    Method = HttpMethod.Post,
                    Path = "/s3/presigned-url",
                    Body = request,
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
                var responseData = JsonUtils.Deserialize<string>(responseBody)!;
                return new WithRawResponse<string>()
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
                throw new SeedMultiUrlEnvironmentApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedMultiUrlEnvironmentApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.S3.GetPresignedUrlAsync(new GetPresignedUrlRequest { S3Key = "s3Key" });
    /// </code></example>
    public WithRawResponseTask<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<string>(
            GetPresignedUrlAsyncCore(request, options, cancellationToken)
        );
    }
}
