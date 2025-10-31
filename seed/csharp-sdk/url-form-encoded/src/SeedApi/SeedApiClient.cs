using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SeedApi.Core;

namespace SeedApi;

public partial class SeedApiClient
{
    private readonly RawClient _client;

    public SeedApiClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedApi" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernurl-form-encoded/0.0.1" },
            }
        );
        clientOptions ??= new ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new RawClient(clientOptions);
    }

    /// <example><code>
    /// await client.SubmitFormDataAsync(
    ///     new PostSubmitRequest { Username = "johndoe", Email = "john@example.com" }
    /// );
    /// </code></example>
    public async Task<PostSubmitResponse> SubmitFormDataAsync(
        PostSubmitRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new FormRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "submit",
                    Body = request,
                    ContentType = "application/x-www-form-urlencoded",
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
                return JsonUtils.Deserialize<PostSubmitResponse>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedApiException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedApiApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
