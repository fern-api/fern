using System.Net.Http;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class ObjectClient
{
    private RawClient _client;

    public ObjectClient(RawClient client)
    {
        _client = client;
    }

    public async Task<ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(
        ObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/object/get-and-return-with-optional-field",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ObjectWithOptionalField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(
        ObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/object/get-and-return-with-required-field",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ObjectWithRequiredField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(ObjectWithMapOfMap request)
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/object/get-and-return-with-map-of-map",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<ObjectWithMapOfMap>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(
        NestedObjectWithOptionalField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/object/get-and-return-nested-with-optional-field",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<NestedObjectWithOptionalField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(
        string string_,
        NestedObjectWithRequiredField request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = $"/object/get-and-return-nested-with-required-field/{string_}",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<NestedObjectWithRequiredField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(
        IEnumerable<NestedObjectWithRequiredField> request
    )
    {
        var response = await _client.MakeRequestAsync(
            new RawClient.JsonApiRequest
            {
                BaseUrl = _client.Options.BaseUrl,
                Method = HttpMethod.Post,
                Path = "/object/get-and-return-nested-with-required-field-list",
                Body = request
            }
        );
        var responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode is >= 200 and < 400)
        {
            return JsonUtils.Deserialize<NestedObjectWithRequiredField>(responseBody)!;
        }
        throw new Exception(responseBody);
    }
}
