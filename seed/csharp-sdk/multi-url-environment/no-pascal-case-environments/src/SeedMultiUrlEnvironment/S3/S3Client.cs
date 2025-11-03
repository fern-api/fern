using System.Text.Json;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class S3Client
{
    private RawClient _client;

    internal S3Client(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.S3.GetPresignedUrlAsync(new GetPresignedUrlRequest { S3Key = "s3Key" });
    /// </code></example>
    public async Task<string> GetPresignedUrlAsync(
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
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMultiUrlEnvironmentException("Failed to deserialize response", e);
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
}
