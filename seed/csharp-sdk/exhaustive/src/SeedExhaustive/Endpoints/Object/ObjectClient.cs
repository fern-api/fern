using SeedExhaustive.Core;
using SeedExhaustive.Types;
using System.Text.Json;

#nullable enable

namespace SeedExhaustive.Endpoints;

public class ObjectClient
{
    private RawClient _client;
    public ObjectClient (RawClient client) {
        _client = client;
    }

    public async Task<ObjectWithOptionalField> GetAndReturnWithOptionalFieldAsync(ObjectWithOptionalField request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = "/object/get-and-return-with-optional-field", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<ObjectWithOptionalField>(responseBody);
            }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithRequiredField> GetAndReturnWithRequiredFieldAsync(ObjectWithRequiredField request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = "/object/get-and-return-with-required-field", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<ObjectWithRequiredField>(responseBody);
            }
        throw new Exception(responseBody);
    }

    public async Task<ObjectWithMapOfMap> GetAndReturnWithMapOfMapAsync(ObjectWithMapOfMap request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = "/object/get-and-return-with-map-of-map", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<ObjectWithMapOfMap>(responseBody);
            }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithOptionalField> GetAndReturnNestedWithOptionalFieldAsync(NestedObjectWithOptionalField request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = "/object/get-and-return-nested-with-optional-field", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<NestedObjectWithOptionalField>(responseBody);
            }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsync(string string, NestedObjectWithRequiredField request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = $"/object/get-and-return-nested-with-required-field/{string}", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<NestedObjectWithRequiredField>(responseBody);
            }
        throw new Exception(responseBody);
    }

    public async Task<NestedObjectWithRequiredField> GetAndReturnNestedWithRequiredFieldAsListAsync(IEnumerable<NestedObjectWithRequiredField> request) {
        var response = await _client.MakeRequestAsync(new RawClient.JsonApiRequest{
                Method = HttpMethod.Post, Path = "/object/get-and-return-nested-with-required-field-list", Body = request});
        string responseBody = await response.Raw.Content.ReadAsStringAsync();
        if (response.StatusCode >= 200 && response.StatusCode < 400) {
        return JsonSerializer.Deserialize<NestedObjectWithRequiredField>(responseBody);
            }
        throw new Exception(responseBody);
    }

}
