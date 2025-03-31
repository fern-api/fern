using System.Net.Http;
using System.Text.Json;
using System.Threading;
using OneOf;
using SeedExamples.Commons;
using SeedExamples.Core;
using SeedExamples.File;
using SeedExamples.Health;

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private readonly RawClient _client;

    public SeedExamplesClient(string token, ClientOptions? clientOptions = null)
    {
        var defaultHeaders = new Headers(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
                { "X-Fern-SDK-Name", "SeedExamples" },
                { "X-Fern-SDK-Version", Version.Current },
                { "User-Agent", "Fernexamples/0.0.1" },
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
        Commons = new CommonsClient(_client);
        File = new FileClient(_client);
        Health = new HealthClient(_client);
        Service = new ServiceClient(_client);
        Types = new TypesClient(_client);
    }

    public CommonsClient Commons { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public FileClient File { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public HealthClient Health { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public ServiceClient Service { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    public TypesClient Types { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <example><code>
    /// await client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines");
    /// </code></example>
    public async Task<string> EchoAsync(
        string request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
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
                return JsonUtils.Deserialize<string>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }

    /// <example><code>
    /// await client.CreateTypeAsync(BasicType.Primitive);
    /// </code></example>
    public async Task<Identifier> CreateTypeAsync(
        OneOf<BasicType, ComplexType> request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    )
    {
        var response = await _client
            .SendRequestAsync(
                new JsonRequest
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
                return JsonUtils.Deserialize<Identifier>(responseBody)!;
            }
            catch (JsonException e)
            {
                throw new SeedExamplesException("Failed to deserialize response", e);
            }
        }

        {
            var responseBody = await response.Raw.Content.ReadAsStringAsync();
            throw new SeedExamplesApiException(
                $"Error with status code {response.StatusCode}",
                response.StatusCode,
                responseBody
            );
        }
    }
}
