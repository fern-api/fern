using System.Text.Json.Serialization;

#nullable enable

namespace SeedExhaustive.GeneralErrors;

public record BadObjectRequestInfo
{
    [JsonPropertyName("message")]
    public required string Message { get; set; }
}
