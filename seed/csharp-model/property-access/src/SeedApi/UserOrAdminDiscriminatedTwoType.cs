using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UserOrAdminDiscriminatedTwoType.UserOrAdminDiscriminatedTwoTypeSerializer))]
[Serializable]
public readonly record struct UserOrAdminDiscriminatedTwoType : IStringEnum
{
    public static readonly UserOrAdminDiscriminatedTwoType Empty = new(Values.Empty);

    public UserOrAdminDiscriminatedTwoType(string value)
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
    public static UserOrAdminDiscriminatedTwoType FromCustom(string value)
    {
        return new UserOrAdminDiscriminatedTwoType(value);
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

    public static bool operator ==(UserOrAdminDiscriminatedTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UserOrAdminDiscriminatedTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserOrAdminDiscriminatedTwoType value) => value.Value;

    public static explicit operator UserOrAdminDiscriminatedTwoType(string value) => new(value);

    internal class UserOrAdminDiscriminatedTwoTypeSerializer
        : JsonConverter<UserOrAdminDiscriminatedTwoType>
    {
        public override UserOrAdminDiscriminatedTwoType Read(
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
            return new UserOrAdminDiscriminatedTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserOrAdminDiscriminatedTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserOrAdminDiscriminatedTwoType ReadAsPropertyName(
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
            return new UserOrAdminDiscriminatedTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserOrAdminDiscriminatedTwoType value,
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
        public const string Empty = "empty";
    }
}
