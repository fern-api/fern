using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceNopRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    [JsonIgnore]
    public required string NestedId { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
