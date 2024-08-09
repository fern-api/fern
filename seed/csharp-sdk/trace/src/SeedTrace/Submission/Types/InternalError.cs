using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public required ExceptionInfo ExceptionInfo { get; set; }
}
