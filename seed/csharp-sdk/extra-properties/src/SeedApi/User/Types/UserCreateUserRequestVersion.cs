using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UserCreateUserRequestVersion.UserCreateUserRequestVersionSerializer))]
[Serializable]
public readonly record struct UserCreateUserRequestVersion : IStringEnum
{
    public static readonly UserCreateUserRequestVersion V1 = new(Values.V1);

    public UserCreateUserRequestVersion(string value)
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
    public static UserCreateUserRequestVersion FromCustom(string value)
    {
        return new UserCreateUserRequestVersion(value);
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

    public static bool operator ==(UserCreateUserRequestVersion value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UserCreateUserRequestVersion value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserCreateUserRequestVersion value) => value.Value;

    public static explicit operator UserCreateUserRequestVersion(string value) => new(value);

    internal class UserCreateUserRequestVersionSerializer
        : JsonConverter<UserCreateUserRequestVersion>
    {
        public override UserCreateUserRequestVersion Read(
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
            return new UserCreateUserRequestVersion(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserCreateUserRequestVersion value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserCreateUserRequestVersion ReadAsPropertyName(
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
            return new UserCreateUserRequestVersion(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserCreateUserRequestVersion value,
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
        public const string V1 = "v1";
    }
}
