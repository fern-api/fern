using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class HttpMethodsClient
{
    private RawClient _client;

    public HttpMethodsClient(RawClient client)
    {
        _client = client;
    }

    public async Task<string> TestGetAsync(string id)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Get, Path = $"/{id}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception();
    }

    public async Task<ObjectWithOptionalField> TestPostAsync(ObjectWithRequiredField request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async Task<ObjectWithOptionalField> TestPutAsync(
        string id,
        ObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/{id}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async Task<ObjectWithOptionalField> TestPatchAsync(
        string id,
        ObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Patch,
                Path = $"/{id}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async Task<bool> TestDeleteAsync(string id)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest { Method = HttpMethod.Delete, Path = $"/{id}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody);
        }
        throw new Exception();
    }
}
