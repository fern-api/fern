using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public required ExceptionInfo ExceptionInfo { get; set; }
}
