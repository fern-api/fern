using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceGetClientRequest
{
    [JsonIgnore]
    public required string ClientId { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <summary>
    /// Whether specified fields are included or excluded
    /// </summary>
    [JsonIgnore]
    public bool? IncludeFields { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
