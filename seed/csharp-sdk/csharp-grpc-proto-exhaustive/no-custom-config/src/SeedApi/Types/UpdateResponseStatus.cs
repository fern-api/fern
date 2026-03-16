using System.Text.Json;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UpdateResponseStatus.UpdateResponseStatusSerializer))]
[Serializable]
public readonly record struct UpdateResponseStatus : IStringEnum
{
    public static readonly UpdateResponseStatus StatusUnspecified = new(Values.StatusUnspecified);

    public static readonly UpdateResponseStatus StatusPending = new(Values.StatusPending);

    public static readonly UpdateResponseStatus StatusActive = new(Values.StatusActive);

    public static readonly UpdateResponseStatus StatusFailed = new(Values.StatusFailed);

    public UpdateResponseStatus(string value)
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
    public static UpdateResponseStatus FromCustom(string value)
    {
        return new UpdateResponseStatus(value);
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

    public static bool operator ==(UpdateResponseStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UpdateResponseStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UpdateResponseStatus value) => value.Value;

    public static explicit operator UpdateResponseStatus(string value) => new(value);

    internal class UpdateResponseStatusSerializer : JsonConverter<UpdateResponseStatus>
    {
        public override UpdateResponseStatus Read(
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
            return new UpdateResponseStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UpdateResponseStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string StatusUnspecified = "STATUS_UNSPECIFIED";

        public const string StatusPending = "STATUS_PENDING";

        public const string StatusActive = "STATUS_ACTIVE";

        public const string StatusFailed = "STATUS_FAILED";
    }
}
