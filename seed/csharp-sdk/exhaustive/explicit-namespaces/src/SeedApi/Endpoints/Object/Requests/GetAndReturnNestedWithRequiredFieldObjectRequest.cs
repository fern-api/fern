using global::System.Text.Json.Serialization;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Endpoints.Object;

[Serializable]
public record GetAndReturnNestedWithRequiredFieldObjectRequest
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
