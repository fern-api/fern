using System.Text.Json.Serialization

namespace SeedAudiencesClient

public class FilteredType
{
    [JsonPropertyName("public_property")]
    public string? PublicProperty { get; init; }
    [JsonPropertyName("private_property")]
    public int PrivateProperty { get; init; }
}
