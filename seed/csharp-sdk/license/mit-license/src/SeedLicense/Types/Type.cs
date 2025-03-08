using System.Text.Json.Serialization;
using SeedLicense.Core;

namespace SeedLicense;

/// <summary>
/// A simple type with just a name.
/// </summary>
public record Type
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
