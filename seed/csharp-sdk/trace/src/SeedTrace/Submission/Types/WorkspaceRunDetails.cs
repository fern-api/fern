using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record WorkspaceRunDetails
{
    [JsonPropertyName("exceptionV2")]
    public object? ExceptionV2 { get; }

    [JsonPropertyName("exception")]
    public ExceptionInfo? Exception { get; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; }
}
