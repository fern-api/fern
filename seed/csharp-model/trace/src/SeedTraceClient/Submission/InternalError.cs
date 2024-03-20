using System.Text.Json.Serialization;
using SeedTraceClient;

namespace SeedTraceClient;

public class InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public ExceptionInfo ExceptionInfo { get; init; }
}
