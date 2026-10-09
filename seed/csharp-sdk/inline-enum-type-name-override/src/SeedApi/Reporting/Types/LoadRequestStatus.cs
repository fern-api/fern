using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(LoadRequestStatus.LoadRequestStatusSerializer))]
[Serializable]
public readonly record struct LoadRequestStatus : IStringEnum
{
    public static readonly LoadRequestStatus Active = new(Values.Active);

    public static readonly LoadRequestStatus Inactive = new(Values.Inactive);

    public static readonly LoadRequestStatus Pending = new(Values.Pending);

    public LoadRequestStatus(string value)
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
    public static LoadRequestStatus FromCustom(string value)
    {
        return new LoadRequestStatus(value);
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

    public static bool operator ==(LoadRequestStatus value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(LoadRequestStatus value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(LoadRequestStatus value) => value.Value;

    public static explicit operator LoadRequestStatus(string value) => new(value);

    internal class LoadRequestStatusSerializer : JsonConverter<LoadRequestStatus>
    {
        public override LoadRequestStatus Read(
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
            return new LoadRequestStatus(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            LoadRequestStatus value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override LoadRequestStatus ReadAsPropertyName(
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
            return new LoadRequestStatus(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            LoadRequestStatus value,
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
        public const string Active = "active";

        public const string Inactive = "inactive";

        public const string Pending = "pending";
    }
}
