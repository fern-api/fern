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

    public async Task<string> GetPresignedUrlAsync(GetPresignedUrlRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/s3/presigned-url",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
