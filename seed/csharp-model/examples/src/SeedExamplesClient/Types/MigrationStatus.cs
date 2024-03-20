using System.Text.Json.Serialization;
using System;
using SeedExamplesClient.Utilities;

namespace SeedExamplesClient;

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
