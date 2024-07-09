using System.Net.Http;
using System.Text.Json;
using SeedExamples;
using SeedExamples.Commons;
using SeedExamples.Core;
using SeedExamples.File;
using SeedExamples.Health;

#nullable enable

namespace SeedExamples;

public partial class SeedExamplesClient
{
    private RawClient _client;

    public SeedExamplesClient(string token, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            clientOptions ?? new ClientOptions()
        );
        Commons = new CommonsClient(_client);
        File = new FileClient(_client);
        Health = new HealthClient(_client);
        Service = new ServiceClient(_client);
        Types = new TypesClient(_client);
    }

    public CommonsClient Commons { get; }

    public FileClient File { get; }

    public HealthClient Health { get; }

    public ServiceClient Service { get; }

    public TypesClient Types { get; }

    public async Task<string> EchoAsync(string request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
