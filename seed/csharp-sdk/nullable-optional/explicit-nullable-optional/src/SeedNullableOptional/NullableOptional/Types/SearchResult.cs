// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

/// <summary>
/// Undiscriminated union for testing
/// </summary>
[JsonConverter(typeof(SearchResult.JsonConverter))]
[Serializable]
public record SearchResult
{
    internal SearchResult(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SearchResult with <see cref="SearchResult.User"/>.
    /// </summary>
    public SearchResult(SearchResult.User value)
    {
        Type = "user";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SearchResult with <see cref="SearchResult.Organization"/>.
    /// </summary>
    public SearchResult(SearchResult.Organization value)
    {
        Type = "organization";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SearchResult with <see cref="SearchResult.Document"/>.
    /// </summary>
    public SearchResult(SearchResult.Document value)
    {
        Type = "document";
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

    /// <summary>
    /// Returns true if <see cref="Type"/> is "user"
    /// </summary>
    public bool IsUser => Type == "user";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "organization"
    /// </summary>
    public bool IsOrganization => Type == "organization";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "document"
    /// </summary>
    public bool IsDocument => Type == "document";

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.UserResponse"/> if <see cref="Type"/> is 'user', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'user'.</exception>
    public SeedNullableOptional.UserResponse AsUser() =>
        IsUser
            ? (SeedNullableOptional.UserResponse)Value!
            : throw new System.Exception("SearchResult.Type is not 'user'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.Organization"/> if <see cref="Type"/> is 'organization', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'organization'.</exception>
    public SeedNullableOptional.Organization AsOrganization() =>
        IsOrganization
            ? (SeedNullableOptional.Organization)Value!
            : throw new System.Exception("SearchResult.Type is not 'organization'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNullableOptional.Document"/> if <see cref="Type"/> is 'document', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'document'.</exception>
    public SeedNullableOptional.Document AsDocument() =>
        IsDocument
            ? (SeedNullableOptional.Document)Value!
            : throw new System.Exception("SearchResult.Type is not 'document'");

    public T Match<T>(
        Func<SeedNullableOptional.UserResponse, T> onUser,
        Func<SeedNullableOptional.Organization, T> onOrganization,
        Func<SeedNullableOptional.Document, T> onDocument,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "user" => onUser(AsUser()),
            "organization" => onOrganization(AsOrganization()),
            "document" => onDocument(AsDocument()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedNullableOptional.UserResponse> onUser,
        Action<SeedNullableOptional.Organization> onOrganization,
        Action<SeedNullableOptional.Document> onDocument,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "user":
                onUser(AsUser());
                break;
            case "organization":
                onOrganization(AsOrganization());
                break;
            case "document":
                onDocument(AsDocument());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.UserResponse"/> and returns true if successful.
    /// </summary>
    public bool TryAsUser(out SeedNullableOptional.UserResponse? value)
    {
        if (Type == "user")
        {
            value = (SeedNullableOptional.UserResponse)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.Organization"/> and returns true if successful.
    /// </summary>
    public bool TryAsOrganization(out SeedNullableOptional.Organization? value)
    {
        if (Type == "organization")
        {
            value = (SeedNullableOptional.Organization)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNullableOptional.Document"/> and returns true if successful.
    /// </summary>
    public bool TryAsDocument(out SeedNullableOptional.Document? value)
    {
        if (Type == "document")
        {
            value = (SeedNullableOptional.Document)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SearchResult(SearchResult.User value) => new(value);

    public static implicit operator SearchResult(SearchResult.Organization value) => new(value);

    public static implicit operator SearchResult(SearchResult.Document value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SearchResult>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(SearchResult).IsAssignableFrom(typeToConvert);

        public override SearchResult Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
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
                "user" => json.Deserialize<SeedNullableOptional.UserResponse?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.UserResponse"
                    ),
                "organization" => json.Deserialize<SeedNullableOptional.Organization?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.Organization"
                    ),
                "document" => json.Deserialize<SeedNullableOptional.Document?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNullableOptional.Document"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new SearchResult(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SearchResult value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "user" => JsonSerializer.SerializeToNode(value.Value, options),
                    "organization" => JsonSerializer.SerializeToNode(value.Value, options),
                    "document" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for user
    /// </summary>
    [Serializable]
    public struct User
    {
        public User(SeedNullableOptional.UserResponse value)
        {
            Value = value;
        }

        internal SeedNullableOptional.UserResponse Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SearchResult.User(
            SeedNullableOptional.UserResponse value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for organization
    /// </summary>
    [Serializable]
    public struct Organization
    {
        public Organization(SeedNullableOptional.Organization value)
        {
            Value = value;
        }

        internal SeedNullableOptional.Organization Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SearchResult.Organization(
            SeedNullableOptional.Organization value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for document
    /// </summary>
    [Serializable]
    public struct Document
    {
        public Document(SeedNullableOptional.Document value)
        {
            Value = value;
        }

        internal SeedNullableOptional.Document Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SearchResult.Document(
            SeedNullableOptional.Document value
        ) => new(value);
    }
}
