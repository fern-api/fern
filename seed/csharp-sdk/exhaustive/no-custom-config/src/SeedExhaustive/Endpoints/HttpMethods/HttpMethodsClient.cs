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
            new RawClient.JsonApiRequest { Method = HttpMethod.Get, Path = $"/http-methods/{id}" }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<string>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithOptionalField> TestPostAsync(ObjectWithRequiredField request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/http-methods",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithOptionalField> TestPutAsync(
        string id,
        ObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Put,
                Path = $"/http-methods/{id}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithOptionalField> TestPatchAsync(
        string id,
        ObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Patch,
                Path = $"/http-methods/{id}",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception(responseBody);
    }

    public async Task<bool> TestDeleteAsync(string id)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                Method = HttpMethod.Delete,
                Path = $"/http-methods/{id}"
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<bool>(responseBody);
        }
        throw new Exception(responseBody);
    }
}
