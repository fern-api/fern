using System.Runtime.Serialization;

#nullable enable

namespace SeedTrace;

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
    FailedToLaunch
}
