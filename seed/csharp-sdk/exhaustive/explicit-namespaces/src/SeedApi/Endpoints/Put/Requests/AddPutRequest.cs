using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints.Put;

[Serializable]
public record AddPutRequest
{
    [JsonIgnore]
    public required string Id { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
