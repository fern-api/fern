using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record PatchProxyRequest
{
    [Nullable]
    [JsonPropertyName("application")]
    public string? Application { get; set; }

    [Nullable]
    [JsonPropertyName("require_auth")]
    public bool? RequireAuth { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
