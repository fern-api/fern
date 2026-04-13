using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServicePatchRequest
{
    [JsonPropertyName("application")]
    public string? Application { get; set; }

    [JsonPropertyName("require_auth")]
    public bool? RequireAuth { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
