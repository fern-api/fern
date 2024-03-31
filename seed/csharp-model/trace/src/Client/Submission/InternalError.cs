using System.Text.Json.Serialization;
using Client;

namespace Client;

public class InternalError
{
    [JsonPropertyName("exceptionInfo")]
    public ExceptionInfo ExceptionInfo { get; init; }
}
