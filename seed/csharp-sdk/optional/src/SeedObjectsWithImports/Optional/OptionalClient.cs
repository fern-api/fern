using System.Net.Http;
using System.Text.Json;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

public class OptionalClient
{
    private RawClient _client;

    public OptionalClient(RawClient client)
    {
        _client = client;
    }

    public async Task<string> SendOptionalBodyAsync(
        Dictionary<string, object?>? request,
        RequestOptions? options = null
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "send-optional-body",
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
                throw new SeedObjectsWithImportsException("Failed to deserialize response", e);
            }
        }

        throw new SeedObjectsWithImportsApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
