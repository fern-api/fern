using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record CreateResponse
{
    [JsonPropertyName("user")]
    public UserModel? User { get; set; }
}
