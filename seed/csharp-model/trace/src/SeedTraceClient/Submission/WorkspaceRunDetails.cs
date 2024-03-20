using System.Text.Json.Serialization;
using OneOf;
using SeedTraceClient;

namespace SeedTraceClient;

public class WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public OneOf<ExceptionV2._Generic, ExceptionV2._Timeout>? ExceptionV2 { get; init; }

    [JsonPropertyName("exception")]
    public ExceptionInfo? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
