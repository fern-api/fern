using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[JsonConverter(typeof(UserRole.UserRoleSerializer))]
[Serializable]
public readonly record struct UserRole : IStringEnum
{
    public static readonly UserRole Admin = new(Values.Admin);

    public static readonly UserRole User = new(Values.User);

    public static readonly UserRole Guest = new(Values.Guest);

    public static readonly UserRole Moderator = new(Values.Moderator);

    public UserRole(string value)
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
    public static UserRole FromCustom(string value)
    {
        return new UserRole(value);
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

    public static bool operator ==(UserRole value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(UserRole value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(UserRole value) => value.Value;

    public static explicit operator UserRole(string value) => new(value);

    internal class UserRoleSerializer : JsonConverter<UserRole>
    {
        public override UserRole Read(
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
            return new UserRole(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserRole value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UserRole ReadAsPropertyName(
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
            return new UserRole(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UserRole value,
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
        public const string Admin = "ADMIN";

        public const string User = "USER";

        public const string Guest = "GUEST";

        public const string Moderator = "MODERATOR";
    }
}
