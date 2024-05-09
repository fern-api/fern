using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public class ContainerClient
{
    private RawClient _client;

    public ContainerClient(RawClient client)
    {
        _client = client;
    }

    public async List<List<string>> GetAndReturnListOfPrimitivesAsync(List<List<string>> request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/list-of-primitives",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<List<string>>>(responseBody);
        }
        throw new Exception();
    }

    public async List<List<ObjectWithRequiredField>> GetAndReturnListOfObjectsAsync(
        List<List<ObjectWithRequiredField>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/list-of-objects",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<List<ObjectWithRequiredField>>>(responseBody);
        }
        throw new Exception();
    }

    public async List<HashSet<string>> GetAndReturnSetOfPrimitivesAsync(
        List<HashSet<string>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/set-of-primitives",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<HashSet<string>>>(responseBody);
        }
        throw new Exception();
    }

    public async List<HashSet<ObjectWithRequiredField>> GetAndReturnSetOfObjectsAsync(
        List<HashSet<ObjectWithRequiredField>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/set-of-objects",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<HashSet<ObjectWithRequiredField>>>(responseBody);
        }
        throw new Exception();
    }

    public async List<Dictionary<string, string>> GetAndReturnMapPrimToPrimAsync(
        List<Dictionary<string, string>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/map-prim-to-prim",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Dictionary<string, string>>>(responseBody);
        }
        throw new Exception();
    }

    public async List<
        Dictionary<string, ObjectWithRequiredField>
    > GetAndReturnMapOfPrimToObjectAsync(List<Dictionary<string, ObjectWithRequiredField>> request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/map-prim-to-object",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<Dictionary<string, ObjectWithRequiredField>>>(
                responseBody
            );
        }
        throw new Exception();
    }

    public async List<ObjectWithRequiredField?> GetAndReturnOptionalAsync(
        List<ObjectWithRequiredField?> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/opt-objects",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<List<ObjectWithRequiredField?>>(responseBody);
        }
        throw new Exception();
    }
}
