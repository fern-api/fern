using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record EndpointsHttpMethodsTestPatchRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    [JsonIgnore]
    public required TypesObjectWithOptionalField Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
