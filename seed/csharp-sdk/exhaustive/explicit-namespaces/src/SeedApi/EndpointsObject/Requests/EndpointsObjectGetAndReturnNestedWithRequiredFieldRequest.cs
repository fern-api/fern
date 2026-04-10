using global::System.Text.Json.Serialization;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.EndpointsObject;

[Serializable]
public record EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest
{
    [JsonIgnore]
    public required string String { get; set; }

    [JsonIgnore]
    public required TypesNestedObjectWithRequiredField Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
