using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedMultiUrlEnvironment.Core;

namespace SeedMultiUrlEnvironment;

public partial class S3Client
{
    private RawClient _client;

    internal S3Client(RawClient client)
    {
        _client = client;
    }

    /// <example>
    /// <code>
    /// await client.S3.GetPresignedUrlAsync(new GetPresignedUrlRequest { S3Key = "s3Key" });
    /// </code>
    /// </example>
    public async Task<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .MakeRequestAsync(
                new RawClient.JsonApiRequest
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
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMultiUrlEnvironmentException("Failed to deserialize response", e);
            }
        }

        throw new SeedMultiUrlEnvironmentApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            responseBody
        );
    }
}
