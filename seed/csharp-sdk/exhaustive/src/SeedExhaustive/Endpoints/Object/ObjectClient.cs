using System.Text.Json;
using SeedExhaustive;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

public class ObjectClient
{
    private RawClient _client;

    public ObjectClient(RawClient client)
    {
        _client = client;
    }

    public async ObjectWithOptionalField GetAndReturnWithOptionalFieldAsync(
        ObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-with-optional-field",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async ObjectWithRequiredField GetAndReturnWithRequiredFieldAsync(
        ObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-with-required-field",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithRequiredField>(responseBody);
        }
        throw new Exception();
    }

    public async ObjectWithMapOfMap GetAndReturnWithMapOfMapAsync(ObjectWithMapOfMap request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-with-map-of-map",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<ObjectWithMapOfMap>(responseBody);
        }
        throw new Exception();
    }

    public async NestedObjectWithOptionalField GetAndReturnNestedWithOptionalFieldAsync(
        NestedObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-nested-with-optional-field",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<NestedObjectWithOptionalField>(responseBody);
        }
        throw new Exception();
    }

    public async NestedObjectWithRequiredField GetAndReturnNestedWithRequiredFieldAsync(
        NestedObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-nested-with-required-field",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<NestedObjectWithRequiredField>(responseBody);
        }
        throw new Exception();
    }

    public async NestedObjectWithRequiredField GetAndReturnNestedWithRequiredFieldAsListAsync(
        List<List<NestedObjectWithRequiredField>> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.ApiRequest
            {
                Method = HttpMethod.Post,
                Path = "/get-and-return-nested-with-required-field-list",
                Body = request
            }
        );
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (responseBody.StatusCode >= 200 && responseBody.StatusCode < 400)
        {
            return JsonSerializer.Deserialize<NestedObjectWithRequiredField>(responseBody);
        }
        throw new Exception();
    }
}
