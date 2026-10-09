using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record IdentifierUpdate
{
    [JsonIgnore]
    public required string ProfileId { get; set; }

    [JsonIgnore]
    public required string IdTypePathParam { get; set; }

    /// <summary>
    /// The identifier type to update.
    /// </summary>
    [JsonPropertyName("idType")]
    public required string IdType { get; set; }

    [JsonPropertyName("oldValue")]
    public required string OldValue { get; set; }

    [JsonPropertyName("newValue")]
    public required string NewValue { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
