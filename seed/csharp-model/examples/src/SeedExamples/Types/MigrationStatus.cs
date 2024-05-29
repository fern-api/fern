using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExamples;
using SeedExamples.Core;

#nullable enable

namespace SeedExamples;

[JsonConverter(typeof(StringEnumSerializer<MigrationStatus>))]
public enum MigrationStatus
{
    [EnumMember(Value = "RUNNING")]
    Running,

    [EnumMember(Value = "FAILED")]
    Failed,

    [EnumMember(Value = "FINISHED")]
    Finished
}
