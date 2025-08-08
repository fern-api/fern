using System.Net.Http;
using System.Text.Json;
using System.Threading;
using OneOf;

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private readonly SeedExamples.Core.RawClient _client;

    public SeedExamplesClient(string token, SeedExamples.ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new SeedExamples.Core.Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExamples" },
                { "X-Fern-SDK-Version", SeedExamples.Version.Current },
                { "User-Agent", "Fernexamples/0.0.1" },
            }
        );
        clientOptions ??= new SeedExamples.ClientOptions();
        foreach (var header in defaultHeaders)
        {
            if (!clientOptions.Headers.ContainsKey(header.Key))
            {
                clientOptions.Headers[header.Key] = header.Value;
            }
        }
        _client = new SeedExamples.Core.RawClient(clientOptions);
        File = new SeedExamples.File.FileClient(_client);
        Health = new SeedExamples.Health.HealthClient(_client);
        Service = new SeedExamples.ServiceClient(_client);
    }

    public SeedExamples.File.FileClient File { get; }

    public SeedExamples.Health.HealthClient Health { get; }

    public SeedExamples.ServiceClient Service { get; }

    /// <example><code>
    /// await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
    /// </code></example>
    public async Task<string> EchoAsync(
        string request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
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
                return SeedExamples.Core.JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.CreateTypeAsync(SeedExamples.BasicType.Primitive);
    /// </code></example>
    public async Task<SeedExamples.Identifier> CreateTypeAsync(
        OneOf<SeedExamples.BasicType, SeedExamples.ComplexType> request,
        SeedExamples.RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new SeedExamples.Core.JsonRequest
                {
                    BaseUrl = _client.Options.BaseUrl,
                    Method = HttpMethod.Post,
                    Path = "",
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
                return SeedExamples.Core.JsonUtils.Deserialize<SeedExamples.Identifier>(
                    responseBody
                )!;
            }
            catch (JsonException e)
            {
                throw new SeedExamples.SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamples.SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
