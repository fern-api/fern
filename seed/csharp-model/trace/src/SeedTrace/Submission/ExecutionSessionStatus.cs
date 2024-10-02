using System;
using System.Text.Json.Serialization;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

[JsonConverter(typeof(StringEnumSerializer<ExecutionSessionStatus>))]
public readonly struct ExecutionSessionStatus : IStringEnum, IEquatable<ExecutionSessionStatus>
{
    public ExecutionSessionStatus(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    public static readonly ExecutionSessionStatus CreatingContainer = Custom(
        Values.CreatingContainer
    );

    public static readonly ExecutionSessionStatus ProvisioningContainer = Custom(
        Values.ProvisioningContainer
    );

    public static readonly ExecutionSessionStatus PendingContainer = Custom(
        Values.PendingContainer
    );

    public static readonly ExecutionSessionStatus RunningContainer = Custom(
        Values.RunningContainer
    );

    public static readonly ExecutionSessionStatus LiveContainer = Custom(Values.LiveContainer);

    public static readonly ExecutionSessionStatus FailedToLaunch = Custom(Values.FailedToLaunch);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    public static class Values
    {
        public const string CreatingContainer = "CREATING_CONTAINER";

        public const string ProvisioningContainer = "PROVISIONING_CONTAINER";

        public const string PendingContainer = "PENDING_CONTAINER";

        public const string RunningContainer = "RUNNING_CONTAINER";

        public const string LiveContainer = "LIVE_CONTAINER";

        public const string FailedToLaunch = "FAILED_TO_LAUNCH";
    }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ExecutionSessionStatus Custom(string value)
    {
        return new ExecutionSessionStatus(value);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public bool Equals(ExecutionSessionStatus other)
    {
        return Value == other.Value;
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (obj is string stringObj)
            return Value.Equals(stringObj);
        if (obj.GetType() != GetType())
            return false;
        return Equals((ExecutionSessionStatus)obj);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public static bool operator ==(ExecutionSessionStatus value1, ExecutionSessionStatus value2) =>
        value1.Equals(value2);

    public static bool operator !=(ExecutionSessionStatus value1, ExecutionSessionStatus value2) =>
        !(value1 == value2);

    public static bool operator ==(ExecutionSessionStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ExecutionSessionStatus value1, string value2) =>
        !value1.Value.Equals(value2);
}
