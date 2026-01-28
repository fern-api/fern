using System.Text.Json;
using SeedCsharpXmlEntities.Core;

namespace SeedCsharpXmlEntities;

public partial class SeedCsharpXmlEntitiesClient : ISeedCsharpXmlEntitiesClient
{
    private readonly RawClient _client;

    public SeedCsharpXmlEntitiesClient(ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedCsharpXmlEntities" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Ferncsharp-xml-entities/0.0.1" },
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

    private async Task<WithRawResponse<TimeZoneModel>> GetTimeZoneAsyncCore(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var _headers = await new SeedCsharpXmlEntities.Core.HeadersBuilder.Builder()
            .AddWithoutAuth(_client.Options.Headers)
            .Add(_client.Options.AdditionalHeaders)
            .Add(options?.AdditionalHeaders)
            .BuildAsync()
            .ConfigureAwait(false);
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Get,
                    Path = "/timezone",
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
                var responseData = JsonUtils.Deserialize<TimeZoneModel>(responseBody)!;
                return new WithRawResponse<TimeZoneModel>()
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
                throw new SeedCsharpXmlEntitiesApiException(
                    "Failed to deserialize response",
                    response.StatusCode,
                    responseBody,
                    e
                );
            }
        }
        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedCsharpXmlEntitiesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <summary>
    /// Get timezone information with + offset
    /// </summary>
    /// <example><code>
    /// await client.GetTimeZoneAsync();
    /// </code></example>
    public WithRawResponseTask<TimeZoneModel> GetTimeZoneAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        return new WithRawResponseTask<TimeZoneModel>(
            GetTimeZoneAsyncCore(options, cancellationToken)
        );
    }
}
