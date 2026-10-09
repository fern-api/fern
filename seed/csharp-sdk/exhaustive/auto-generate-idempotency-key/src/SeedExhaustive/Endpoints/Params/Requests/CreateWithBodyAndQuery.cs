using global::System.Text.Json.Serialization;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Endpoints;

[Serializable]
public record CreateWithBodyAndQuery
{
    [JsonIgnore]
    public string? Fields { get; set; }

    [JsonIgnore]
    public required ObjectWithRequiredField Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
