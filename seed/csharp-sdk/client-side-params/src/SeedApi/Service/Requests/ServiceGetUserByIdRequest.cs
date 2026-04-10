using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceGetUserByIdRequest
{
    [JsonIgnore]
    public required string UserId { get; set; }

    /// <summary>
    /// Comma-separated list of fields to include or exclude
    /// </summary>
    [JsonIgnore]
    public string? Fields { get; set; }

    /// <summary>
    /// true to include the fields specified, false to exclude them
    /// </summary>
    [JsonIgnore]
    public bool? IncludeFields { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
