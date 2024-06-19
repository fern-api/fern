using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences;

public class FilteredType
{
    [JsonPropertyName("public_property")]
    public string? PublicProperty { get; init; }

    [JsonPropertyName("private_property")]
    public int PrivateProperty { get; init; }
}
