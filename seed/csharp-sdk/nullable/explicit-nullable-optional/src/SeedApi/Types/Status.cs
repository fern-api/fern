// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Status.JsonConverter))]
[Serializable]
public record Status
{
    internal Status(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.Active"/>.
    /// </summary>
    public Status(Status.Active value)
    {
        Type = "active";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.Archived"/>.
    /// </summary>
    public Status(Status.Archived value)
    {
        Type = "archived";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Status with <see cref="Status.SoftDeleted"/>.
    /// </summary>
    public Status(Status.SoftDeleted value)
    {
        Type = "soft-deleted";
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
    /// Returns true if <see cref="Type"/> is "active"
    /// </summary>
    public bool IsActive => Type == "active";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "archived"
    /// </summary>
    public bool IsArchived => Type == "archived";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "soft-deleted"
    /// </summary>
    public bool IsSoftDeleted => Type == "soft-deleted";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.StatusActive"/> if <see cref="Type"/> is 'active', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'active'.</exception>
    public SeedApi.StatusActive AsActive() =>
        IsActive
            ? (SeedApi.StatusActive)Value!
            : throw new global::System.Exception("Status.Type is not 'active'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.StatusArchived"/> if <see cref="Type"/> is 'archived', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'archived'.</exception>
    public SeedApi.StatusArchived AsArchived() =>
        IsArchived
            ? (SeedApi.StatusArchived)Value!
            : throw new global::System.Exception("Status.Type is not 'archived'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.StatusSoftDeleted"/> if <see cref="Type"/> is 'soft-deleted', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'soft-deleted'.</exception>
    public SeedApi.StatusSoftDeleted AsSoftDeleted() =>
        IsSoftDeleted
            ? (SeedApi.StatusSoftDeleted)Value!
            : throw new global::System.Exception("Status.Type is not 'soft-deleted'");

    public T Match<T>(
        Func<SeedApi.StatusActive, T> onActive,
        Func<SeedApi.StatusArchived, T> onArchived,
        Func<SeedApi.StatusSoftDeleted, T> onSoftDeleted,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "active" => onActive(AsActive()),
            "archived" => onArchived(AsArchived()),
            "soft-deleted" => onSoftDeleted(AsSoftDeleted()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.StatusActive> onActive,
        Action<SeedApi.StatusArchived> onArchived,
        Action<SeedApi.StatusSoftDeleted> onSoftDeleted,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "active":
                onActive(AsActive());
                break;
            case "archived":
                onArchived(AsArchived());
                break;
            case "soft-deleted":
                onSoftDeleted(AsSoftDeleted());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.StatusActive"/> and returns true if successful.
    /// </summary>
    public bool TryAsActive(out SeedApi.StatusActive? value)
    {
        if (Type == "active")
        {
            value = (SeedApi.StatusActive)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.StatusArchived"/> and returns true if successful.
    /// </summary>
    public bool TryAsArchived(out SeedApi.StatusArchived? value)
    {
        if (Type == "archived")
        {
            value = (SeedApi.StatusArchived)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.StatusSoftDeleted"/> and returns true if successful.
    /// </summary>
    public bool TryAsSoftDeleted(out SeedApi.StatusSoftDeleted? value)
    {
        if (Type == "soft-deleted")
        {
            value = (SeedApi.StatusSoftDeleted)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Status(Status.Active value) => new(value);

    public static implicit operator Status(Status.Archived value) => new(value);

    public static implicit operator Status(Status.SoftDeleted value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Status>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Status).IsAssignableFrom(typeToConvert);

        public override Status Read(
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "active" => jsonWithoutDiscriminator.Deserialize<SeedApi.StatusActive?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.StatusActive"),
                "archived" => jsonWithoutDiscriminator.Deserialize<SeedApi.StatusArchived?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.StatusArchived"),
                "soft-deleted" => jsonWithoutDiscriminator.Deserialize<SeedApi.StatusSoftDeleted?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.StatusSoftDeleted"),
                _ => json.Deserialize<object?>(options),
            };
            return new Status(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Status value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "active" => JsonSerializer.SerializeToNode(value.Value, options),
                    "archived" => JsonSerializer.SerializeToNode(value.Value, options),
                    "soft-deleted" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override Status ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new Status(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Status value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for active
    /// </summary>
    [Serializable]
    public struct Active
    {
        public Active(SeedApi.StatusActive value)
        {
            Value = value;
        }

        internal SeedApi.StatusActive Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Status.Active(SeedApi.StatusActive value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for archived
    /// </summary>
    [Serializable]
    public struct Archived
    {
        public Archived(SeedApi.StatusArchived value)
        {
            Value = value;
        }

        internal SeedApi.StatusArchived Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Status.Archived(SeedApi.StatusArchived value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for soft-deleted
    /// </summary>
    [Serializable]
    public struct SoftDeleted
    {
        public SoftDeleted(SeedApi.StatusSoftDeleted value)
        {
            Value = value;
        }

        internal SeedApi.StatusSoftDeleted Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Status.SoftDeleted(SeedApi.StatusSoftDeleted value) =>
            new(value);
    }
}
