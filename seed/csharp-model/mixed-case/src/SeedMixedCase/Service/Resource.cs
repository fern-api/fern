// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[JsonConverter(typeof(Resource.JsonConverter))]
[Serializable]
public record Resource
{
    internal Resource(string type, object? value)
    {
        ResourceType = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Resource with <see cref="Resource.User"/>.
    /// </summary>
    public Resource(Resource.User value)
    {
        ResourceType = "user";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Resource with <see cref="Resource.Organization"/>.
    /// </summary>
    public Resource(Resource.Organization value)
    {
        ResourceType = "Organization";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("resourceType")]
    public string ResourceType { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    [JsonPropertyName("status")]
    public required ResourceStatus Status { get; set; }

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "user"
    /// </summary>
    public bool IsUser => ResourceType == "user";

    /// <summary>
    /// Returns true if <see cref="ResourceType"/> is "Organization"
    /// </summary>
    public bool IsOrganization => ResourceType == "Organization";

    /// <summary>
    /// Returns the value as a <see cref="SeedMixedCase.User"/> if <see cref="ResourceType"/> is 'user', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'user'.</exception>
    public SeedMixedCase.User AsUser() =>
        IsUser
            ? (SeedMixedCase.User)Value!
            : throw new System.Exception("Resource.ResourceType is not 'user'");

    /// <summary>
    /// Returns the value as a <see cref="SeedMixedCase.Organization"/> if <see cref="ResourceType"/> is 'Organization', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="ResourceType"/> is not 'Organization'.</exception>
    public SeedMixedCase.Organization AsOrganization() =>
        IsOrganization
            ? (SeedMixedCase.Organization)Value!
            : throw new System.Exception("Resource.ResourceType is not 'Organization'");

    public T Match<T>(
        Func<SeedMixedCase.User, T> onUser,
        Func<SeedMixedCase.Organization, T> onOrganization,
        Func<string, object?, T> onUnknown_
    )
    {
        return ResourceType switch
        {
            "user" => onUser(AsUser()),
            "Organization" => onOrganization(AsOrganization()),
            _ => onUnknown_(ResourceType, Value),
        };
    }

    public void Visit(
        Action<SeedMixedCase.User> onUser,
        Action<SeedMixedCase.Organization> onOrganization,
        Action<string, object?> onUnknown_
    )
    {
        switch (ResourceType)
        {
            case "user":
                onUser(AsUser());
                break;
            case "Organization":
                onOrganization(AsOrganization());
                break;
            default:
                onUnknown_(ResourceType, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedMixedCase.User"/> and returns true if successful.
    /// </summary>
    public bool TryAsUser(out SeedMixedCase.User? value)
    {
        if (ResourceType == "user")
        {
            value = (SeedMixedCase.User)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedMixedCase.Organization"/> and returns true if successful.
    /// </summary>
    public bool TryAsOrganization(out SeedMixedCase.Organization? value)
    {
        if (ResourceType == "Organization")
        {
            value = (SeedMixedCase.Organization)Value!;
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
        [JsonPropertyName("status")]
        public required ResourceStatus Status { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Resource>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Resource).IsAssignableFrom(typeToConvert);

        public override Resource Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("resource_type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'resource_type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'resource_type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'resource_type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'resource_type' is null");

            var value = discriminator switch
            {
                "user" => json.Deserialize<SeedMixedCase.User?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedMixedCase.User"),
                "Organization" => json.Deserialize<SeedMixedCase.Organization?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedMixedCase.Organization"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<Resource.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize Resource.BaseProperties");
            return new Resource(discriminator, value) { Status = baseProperties.Status };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Resource value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.ResourceType switch
                {
                    "user" => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                    "Organization" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                } ?? new JsonObject();
            json["resource_type"] = value.ResourceType;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new Resource.BaseProperties { Status = value.Status },
                    options
                ) ?? throw new JsonException("Failed to serialize Resource.BaseProperties");
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
        public User(SeedMixedCase.User value)
        {
            Value = value;
        }

        internal SeedMixedCase.User Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Resource.User(SeedMixedCase.User value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for Organization
    /// </summary>
    [Serializable]
    public struct Organization
    {
        public Organization(SeedMixedCase.Organization value)
        {
            Value = value;
        }

        internal SeedMixedCase.Organization Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Resource.Organization(SeedMixedCase.Organization value) =>
            new(value);
    }
}
