using System.Text.Json;
using SeedSimpleApi.Core;

namespace SeedSimpleApi;

public partial class UserClient
{
    private RawClient _client;

    internal UserClient(RawClient client)
    {
        _client = client;
    }

    /// <example><code>
    /// await client.User.GetAsync("id");
    /// </code></example>
    public async Task<User> GetAsync(
        string id,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = string.Format("/users/{0}", ValueConvert.ToPathParameterString(id)),
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
                return JsonUtils.Deserialize<User>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedSimpleApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedSimpleApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
