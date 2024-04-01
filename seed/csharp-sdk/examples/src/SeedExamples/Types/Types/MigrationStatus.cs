using System.Text.Json.Serialization;
using System;
using SeedExamples.Utilities;

namespace SeedExamples;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum MigrationStatus
{
    [EnumMember(Value = "RUNNING")]
    Running,

    [EnumMember(Value = "FAILED")]
    Failed,

    [EnumMember(Value = "FINISHED")]
    Finished
}
