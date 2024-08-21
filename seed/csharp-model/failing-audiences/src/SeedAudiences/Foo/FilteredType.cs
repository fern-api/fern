using System.Text.Json.Serialization;

#nullable enable

namespace SeedAudiences;

public record FilteredType
{
    [JsonPropertyName("public_property")]
    public string? PublicProperty { get; set; }

    [JsonPropertyName("private_property")]
    public required int PrivateProperty { get; set; }
}
