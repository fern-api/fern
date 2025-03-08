using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// This type allows us to test a circular reference with a union type (see FieldValue).
/// </summary>
public record ObjectFieldValue
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("value")]
    public required object Value { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
