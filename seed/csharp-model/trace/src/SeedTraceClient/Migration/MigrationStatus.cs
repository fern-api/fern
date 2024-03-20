using System.Text.Json.Serialization
using System
using SeedTraceClient.Utilities

namespace SeedTraceClient

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
