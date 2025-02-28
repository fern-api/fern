using System.Text.Json.Serialization;
using SeedAudiences.Core;

namespace SeedAudiences;

public record FindRequest
{
    [JsonIgnore]
    public string? OptionalString { get; set; }

    public string? PublicProperty { get; set; }

    public int? PrivateProperty { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
