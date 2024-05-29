using System.Text.Json.Serialization;
using SeedExamples.Core;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")JsonConverter(typeof(StringEnumSerializer;
    <MigrationStatus;
    >))]
    public MigrationStatus Status { get; init; }
}
