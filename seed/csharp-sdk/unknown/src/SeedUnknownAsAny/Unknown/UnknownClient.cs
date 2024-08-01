using System.Net.Http;
using System.Text.Json;
using SeedUnknownAsAny.Core;

#nullable enable

namespace SeedUnknownAsAny;

public class UnknownClient
{
    private RawClient _client;

    public UnknownClient(RawClient client)
    {
        _client = client;
    }

    public async Task<IEnumerable<object>> PostAsync(object request, RequestOptions? options = null)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "",
                Body = request,
                Options = options
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            try
            {
                return JsonUtils.Deserialize<IEnumerable<object>>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedUnknownAsAnyException("Failed to deserialize response", e);
            }
        }

        throw new SeedUnknownAsAnyApiException(
            $"Error with status code {response.StatusCode}",
            response.StatusCode,
            JsonUtils.Deserialize<object>(responseBody)
        );
    }
}
