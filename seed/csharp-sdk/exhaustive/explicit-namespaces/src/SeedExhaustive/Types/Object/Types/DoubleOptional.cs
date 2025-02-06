using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

public record DoubleOptional
{
    [JsonPropertyName("optionalAlias")]
    public string? OptionalAlias { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
