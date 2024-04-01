using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public ExceptionInfo ExceptionInfo { get; init; }
}
