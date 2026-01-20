using System.Text.Json;
using SeedMultiUrlEnvironmentNoDefault.Core;

namespace SeedMultiUrlEnvironmentNoDefault;

public partial class S3Client : IS3Client
{
    private RawClient _client;

    internal S3Client(RawClient client)
    {
        _client = client;
        Raw = new WithRawResponseClient(_client);
    }

    public S3Client.WithRawResponseClient Raw { get; }

    /// <example><code>
    /// await client.S3.GetPresignedUrlAsync(new GetPresignedUrlRequest { S3Key = "s3Key" });
    /// </code></example>
    public async Task<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await Raw.GetPresignedUrlAsync(request, options, cancellationToken);
        return response.Data;
    }

    public partial class WithRawResponseClient
    {
        private readonly RawClient _client;

        internal WithRawResponseClient(RawClient client)
        {
            _client = client;
        }

        public async Task<WithRawResponse<string>> GetPresignedUrlAsync(
            GetPresignedUrlRequest request,
            RequestOptions? options = null,
            CancellationToken cancellationToken = default
        )
        {
            var response = await _client
                .SendRequestAsync(
                    new JsonRequest
                    {
                        BaseUrl = _client.Options.Environment.S3,
                        Method = HttpMethod.Post,
                        Path = "/s3/presigned-url",
                        Body = request,
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
                    var data = JsonUtils.Deserialize<string>(responseBody)!;
                    return new WithRawResponse<string>
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
                    throw new SeedMultiUrlEnvironmentNoDefaultException(
                        "Failed to deserialize response",
                        e
                    );
                }
            }

            {
                var responseBody = await response.Raw.Content.ReadAsStringAsync();
                throw new SeedMultiUrlEnvironmentNoDefaultApiException(
                    $"Error with status code {response.StatusCode}",
                    response.StatusCode,
                    responseBody
                );
            }
        }
    }
}
