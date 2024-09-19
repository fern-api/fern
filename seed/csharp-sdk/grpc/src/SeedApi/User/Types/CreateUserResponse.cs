using System.Text.Json.Serialization;
using SeedApi.Core;

#nullable enable

namespace SeedApi;

public record CreateUserResponse
{
    [JsonPropertyName("user")]
    public required User User { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
