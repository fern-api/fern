using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public object? ExceptionV2 { get; init; }

    [JsonPropertyName("exception")]
    public ExceptionInfo? Exception { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
