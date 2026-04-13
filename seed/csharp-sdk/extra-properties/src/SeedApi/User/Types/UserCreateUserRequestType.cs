using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UserCreateUserRequestType.UserCreateUserRequestTypeSerializer))]
[Serializable]
public readonly record struct UserCreateUserRequestType : IStringEnum
{
    public static readonly UserCreateUserRequestType CreateUserRequest = new(
        Values.CreateUserRequest
    );

    public UserCreateUserRequestType(string value)
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
    public static UserCreateUserRequestType FromCustom(string value)
    {
        return new UserCreateUserRequestType(value);
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

    public static bool operator ==(UserCreateUserRequestType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UserCreateUserRequestType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UserCreateUserRequestType value) => value.Value;

    public static explicit operator UserCreateUserRequestType(string value) => new(value);

    internal class UserCreateUserRequestTypeSerializer : JsonConverter<UserCreateUserRequestType>
    {
        public override UserCreateUserRequestType Read(
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
            return new UserCreateUserRequestType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserCreateUserRequestType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserCreateUserRequestType ReadAsPropertyName(
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
            return new UserCreateUserRequestType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserCreateUserRequestType value,
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
        public const string CreateUserRequest = "CreateUserRequest";
    }
}
