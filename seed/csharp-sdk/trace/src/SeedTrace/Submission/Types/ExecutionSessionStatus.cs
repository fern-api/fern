using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<ExecutionSessionStatus>))]
public enum ExecutionSessionStatus
{
    [EnumMember(Value = "CREATING_CONTAINER")]
    CreatingContainer,

    [EnumMember(Value = "PROVISIONING_CONTAINER")]
    ProvisioningContainer,

    [EnumMember(Value = "PENDING_CONTAINER")]
    PendingContainer,

    [EnumMember(Value = "RUNNING_CONTAINER")]
    RunningContainer,

    [EnumMember(Value = "LIVE_CONTAINER")]
    LiveContainer,

    [EnumMember(Value = "FAILED_TO_LAUNCH")]
    FailedToLaunch,
}
