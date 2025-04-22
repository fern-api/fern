using System.Text.Json.Serialization;
using SeedExamples.Core;
using System.Runtime.Serialization;

namespace SeedExamples;

[JsonConverter(typeof(EnumSerializer<MigrationStatus>))]
public enum MigrationStatus
{
    [EnumMember(Value = "RUNNING")]Running,

    [EnumMember(Value = "FAILED")]Failed,

    [EnumMember(Value = "FINISHED")]Finished
}
