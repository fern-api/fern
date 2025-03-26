using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(EnumSerializer<MigrationStatus>))]
public enum MigrationStatus
{
    [EnumMember(Value = "RUNNING")]
    Running,

    [EnumMember(Value = "FAILED")]
    Failed,

    [EnumMember(Value = "FINISHED")]
    Finished,
}
