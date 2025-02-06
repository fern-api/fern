using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.GeneralErrors;

public record BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
