using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

public record GetRequest
{
    [JsonIgnore]
    public required double Decimal { get; set; }

    [JsonIgnore]
    public required int Even { get; set; }

    [JsonIgnore]
    public required string Name { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
