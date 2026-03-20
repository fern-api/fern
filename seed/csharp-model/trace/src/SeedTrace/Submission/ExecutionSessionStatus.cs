using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(ExecutionSessionStatus.ExecutionSessionStatusSerializer))]
[Serializable]
public readonly record struct ExecutionSessionStatus : IStringEnum
{
    public static readonly ExecutionSessionStatus CreatingContainer = new(Values.CreatingContainer);

    public static readonly ExecutionSessionStatus ProvisioningContainer = new(
        Values.ProvisioningContainer
    );

    public static readonly ExecutionSessionStatus PendingContainer = new(Values.PendingContainer);

    public static readonly ExecutionSessionStatus RunningContainer = new(Values.RunningContainer);

    public static readonly ExecutionSessionStatus LiveContainer = new(Values.LiveContainer);

    public static readonly ExecutionSessionStatus FailedToLaunch = new(Values.FailedToLaunch);

    public ExecutionSessionStatus(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static ExecutionSessionStatus FromCustom(string value)
    {
        return new ExecutionSessionStatus(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(ExecutionSessionStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ExecutionSessionStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ExecutionSessionStatus value) => value.Value;

    public static explicit operator ExecutionSessionStatus(string value) => new(value);

    internal class ExecutionSessionStatusSerializer : JsonConverter<ExecutionSessionStatus>
    {
        public override ExecutionSessionStatus Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new ExecutionSessionStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExecutionSessionStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ExecutionSessionStatus ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new ExecutionSessionStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ExecutionSessionStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string CreatingContainer = "CREATING_CONTAINER";

        public const string ProvisioningContainer = "PROVISIONING_CONTAINER";

        public const string PendingContainer = "PENDING_CONTAINER";

        public const string RunningContainer = "RUNNING_CONTAINER";

        public const string LiveContainer = "LIVE_CONTAINER";

        public const string FailedToLaunch = "FAILED_TO_LAUNCH";
    }
}
