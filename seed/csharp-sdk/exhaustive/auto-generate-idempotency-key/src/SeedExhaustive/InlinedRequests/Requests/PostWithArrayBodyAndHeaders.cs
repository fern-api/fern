using global::System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive;

[Serializable]
public record PostWithArrayBodyAndHeaders
{
    [JsonIgnore]
    public string? XCustomHeader { get; set; }

    [JsonIgnore]
    public IEnumerable<string> Body { get; set; } = new List<string>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
