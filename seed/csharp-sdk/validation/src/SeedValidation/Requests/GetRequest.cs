using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

[Serializable]
public record GetRequest
{
    [JsonIgnore]
    public required double Decimal { get; set; }

    [JsonIgnore]
    public required int Even { get; set; }

    [JsonIgnore]
    public required string Name { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
