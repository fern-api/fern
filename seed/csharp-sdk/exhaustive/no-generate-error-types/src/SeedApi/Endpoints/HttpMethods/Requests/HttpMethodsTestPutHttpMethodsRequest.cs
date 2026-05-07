using global::System.Text.Json.Serialization;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints;

[Serializable]
public record HttpMethodsTestPutHttpMethodsRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    [JsonIgnore]
    public required TypesObjectWithRequiredField Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
