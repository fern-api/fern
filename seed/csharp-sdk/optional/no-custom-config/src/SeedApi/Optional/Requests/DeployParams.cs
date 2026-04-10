using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record DeployParams
{
    [JsonIgnore]
    public required string ActionId { get; set; }

    [JsonIgnore]
    public required string Id { get; set; }

    [JsonPropertyName("updateDraft")]
    public bool? UpdateDraft { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
