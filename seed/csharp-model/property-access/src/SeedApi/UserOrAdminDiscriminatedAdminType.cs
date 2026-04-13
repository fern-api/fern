using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(UserOrAdminDiscriminatedAdminType.UserOrAdminDiscriminatedAdminTypeSerializer)
)]
[Serializable]
public readonly record struct UserOrAdminDiscriminatedAdminType : IStringEnum
{
    public static readonly UserOrAdminDiscriminatedAdminType Admin = new(Values.Admin);

    public UserOrAdminDiscriminatedAdminType(string value)
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
    public static UserOrAdminDiscriminatedAdminType FromCustom(string value)
    {
        return new UserOrAdminDiscriminatedAdminType(value);
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

    public static bool operator ==(UserOrAdminDiscriminatedAdminType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UserOrAdminDiscriminatedAdminType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserOrAdminDiscriminatedAdminType value) => value.Value;

    public static explicit operator UserOrAdminDiscriminatedAdminType(string value) => new(value);

    internal class UserOrAdminDiscriminatedAdminTypeSerializer
        : JsonConverter<UserOrAdminDiscriminatedAdminType>
    {
        public override UserOrAdminDiscriminatedAdminType Read(
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
            return new UserOrAdminDiscriminatedAdminType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserOrAdminDiscriminatedAdminType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserOrAdminDiscriminatedAdminType ReadAsPropertyName(
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
            return new UserOrAdminDiscriminatedAdminType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserOrAdminDiscriminatedAdminType value,
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
        public const string Admin = "admin";
    }
}
