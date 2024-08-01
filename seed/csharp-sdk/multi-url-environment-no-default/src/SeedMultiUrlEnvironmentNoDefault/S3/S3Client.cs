using System.Net.Http;
using System.Text.Json;
using SeedMultiUrlEnvironmentNoDefault;
using SeedMultiUrlEnvironmentNoDefault.Core;

#nullable enable

namespace SeedMultiUrlEnvironmentNoDefault;

public class S3Client
{
    private RawClient _client;

    public S3Client(RawClient client)
    {
        _client = client;
    }

    public async Task<string> GetPresignedUrlAsync(
        GetPresignedUrlRequest request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.Environment.S3,
                Method = HttpMethod.Post,
                Path = "/s3/presigned-url",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedMultiUrlEnvironmentNoDefaultException(
                    "Failed to deserialize response",
                    e
                );
            }
        }

        throw new SeedMultiUrlEnvironmentNoDefaultApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
