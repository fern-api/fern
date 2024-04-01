using System.Text.Json.Serialization;
using System;
using SeedTrace.Utilities;

namespace SeedTrace;

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
