// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

/// <summary>
/// Example of an discriminated union
/// </summary>
[JsonConverter(typeof(UserOrAdminDiscriminated.JsonConverter))]
[Serializable]
public record UserOrAdminDiscriminated
{
    internal UserOrAdminDiscriminated(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UserOrAdminDiscriminated with <see cref="UserOrAdminDiscriminated.User"/>.
    /// </summary>
    public UserOrAdminDiscriminated(UserOrAdminDiscriminated.User value)
    {
        Type = "user";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UserOrAdminDiscriminated with <see cref="UserOrAdminDiscriminated.Admin"/>.
    /// </summary>
    public UserOrAdminDiscriminated(UserOrAdminDiscriminated.Admin value)
    {
        Type = "admin";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UserOrAdminDiscriminated with <see cref="UserOrAdminDiscriminated.Empty"/>.
    /// </summary>
    public UserOrAdminDiscriminated(UserOrAdminDiscriminated.Empty value)
    {
        Type = "empty";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    [JsonPropertyName("normal")]
    public required string Normal { get; set; }

    [JsonPropertyName("foo")]
    public required Foo Foo { get; set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "user"
    /// </summary>
    public bool IsUser => Type == "user";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "admin"
    /// </summary>
    public bool IsAdmin => Type == "admin";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "empty"
    /// </summary>
    public bool IsEmpty => Type == "empty";

    /// <summary>
    /// Returns the value as a <see cref="SeedPropertyAccess.User"/> if <see cref="Type"/> is 'user', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'user'.</exception>
    public SeedPropertyAccess.User AsUser() =>
        IsUser
            ? (SeedPropertyAccess.User)Value!
            : throw new System.Exception("UserOrAdminDiscriminated.Type is not 'user'");

    /// <summary>
    /// Returns the value as a <see cref="SeedPropertyAccess.Admin"/> if <see cref="Type"/> is 'admin', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'admin'.</exception>
    public SeedPropertyAccess.Admin AsAdmin() =>
        IsAdmin
            ? (SeedPropertyAccess.Admin)Value!
            : throw new System.Exception("UserOrAdminDiscriminated.Type is not 'admin'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'empty', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'empty'.</exception>
    public object AsEmpty() =>
        IsEmpty
            ? Value!
            : throw new System.Exception("UserOrAdminDiscriminated.Type is not 'empty'");

    public T Match<T>(
        Func<SeedPropertyAccess.User, T> onUser,
        Func<SeedPropertyAccess.Admin, T> onAdmin,
        Func<object, T> onEmpty,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "user" => onUser(AsUser()),
            "admin" => onAdmin(AsAdmin()),
            "empty" => onEmpty(AsEmpty()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedPropertyAccess.User> onUser,
        Action<SeedPropertyAccess.Admin> onAdmin,
        Action<object> onEmpty,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "user":
                onUser(AsUser());
                break;
            case "admin":
                onAdmin(AsAdmin());
                break;
            case "empty":
                onEmpty(AsEmpty());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedPropertyAccess.User"/> and returns true if successful.
    /// </summary>
    public bool TryAsUser(out SeedPropertyAccess.User? value)
    {
        if (Type == "user")
        {
            value = (SeedPropertyAccess.User)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedPropertyAccess.Admin"/> and returns true if successful.
    /// </summary>
    public bool TryAsAdmin(out SeedPropertyAccess.Admin? value)
    {
        if (Type == "admin")
        {
            value = (SeedPropertyAccess.Admin)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsEmpty(out object? value)
    {
        if (Type == "empty")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    /// <summary>
    /// Base properties for the discriminated union
    /// </summary>
    [Serializable]
    internal record BaseProperties
    {
        [JsonPropertyName("normal")]
        public required string Normal { get; set; }

        [JsonPropertyName("foo")]
        public required Foo Foo { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UserOrAdminDiscriminated>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UserOrAdminDiscriminated).IsAssignableFrom(typeToConvert);

        public override UserOrAdminDiscriminated Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            var value = discriminator switch
            {
                "user" => json.Deserialize<SeedPropertyAccess.User?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedPropertyAccess.User"),
                "admin" => json.GetProperty("admin").Deserialize<SeedPropertyAccess.Admin?>(options)
                ?? throw new JsonException("Failed to deserialize SeedPropertyAccess.Admin"),
                "empty" => new { },
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<UserOrAdminDiscriminated.BaseProperties>(options)
                ?? throw new JsonException(
                    "Failed to deserialize UserOrAdminDiscriminated.BaseProperties"
                );
            return new UserOrAdminDiscriminated(discriminator, value)
            {
                Normal = baseProperties.Normal,
                Foo = baseProperties.Foo,
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UserOrAdminDiscriminated value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "user" => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                    "admin" => new JsonObject
                    {
                        ["admin"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "empty" => new JsonObject(),
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new UserOrAdminDiscriminated.BaseProperties
                    {
                        Normal = value.Normal,
                        Foo = value.Foo,
                    },
                    options
                )
                ?? throw new JsonException(
                    "Failed to serialize UserOrAdminDiscriminated.BaseProperties"
                );
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for user
    /// </summary>
    [Serializable]
    public struct User
    {
        public User(SeedPropertyAccess.User value)
        {
            Value = value;
        }

        internal SeedPropertyAccess.User Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UserOrAdminDiscriminated.User(
            SeedPropertyAccess.User value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for admin
    /// </summary>
    [Serializable]
    public struct Admin
    {
        public Admin(SeedPropertyAccess.Admin value)
        {
            Value = value;
        }

        internal SeedPropertyAccess.Admin Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UserOrAdminDiscriminated.Admin(
            SeedPropertyAccess.Admin value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for empty
    /// </summary>
    [Serializable]
    public record Empty
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}
