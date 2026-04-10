using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(HeadersSendRequestXEndpointVersion.HeadersSendRequestXEndpointVersionSerializer)
)]
[Serializable]
public readonly record struct HeadersSendRequestXEndpointVersion : IStringEnum
{
    public static readonly HeadersSendRequestXEndpointVersion Two122024 = new(Values.Two122024);

    public HeadersSendRequestXEndpointVersion(string value)
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
    public static HeadersSendRequestXEndpointVersion FromCustom(string value)
    {
        return new HeadersSendRequestXEndpointVersion(value);
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

    public static bool operator ==(HeadersSendRequestXEndpointVersion value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(HeadersSendRequestXEndpointVersion value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(HeadersSendRequestXEndpointVersion value) => value.Value;

    public static explicit operator HeadersSendRequestXEndpointVersion(string value) => new(value);

    internal class HeadersSendRequestXEndpointVersionSerializer
        : JsonConverter<HeadersSendRequestXEndpointVersion>
    {
        public override HeadersSendRequestXEndpointVersion Read(
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
            return new HeadersSendRequestXEndpointVersion(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            HeadersSendRequestXEndpointVersion value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override HeadersSendRequestXEndpointVersion ReadAsPropertyName(
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
            return new HeadersSendRequestXEndpointVersion(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            HeadersSendRequestXEndpointVersion value,
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
        public const string Two122024 = "02-12-2024";
    }
}
