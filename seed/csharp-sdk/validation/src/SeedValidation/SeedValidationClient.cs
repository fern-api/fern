using System;
using System.Net.Http;
using SeedValidation;
using SeedValidation.Core;

#nullable enable

namespace SeedValidation;

public partial class SeedValidationClient
{
    private RawClient _client;

    public SeedValidationClient(ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>() { { "X-Fern-Language", "C#" }, },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
    }

    public async Task<Type> CreateAsync(CreateRequest request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/create",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Type>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<Type> GetAsync(GetRequest request)
    {
        var _query = new Dictionary<string, object>()
        {
            { "decimal", request.Decimal.ToString() },
            { "even", request.Even.ToString() },
            { "name", request.Name },
        };
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Get,
                Path = "",
                Query = _query
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<Type>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
