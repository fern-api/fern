using global::System.Reflection;
using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using global::System.Text.Json.Serialization.Metadata;

namespace SeedObject.Core;

internal static partial class JsonOptions
{
    internal static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters =
            {
                new DateTimeSerializer(),
#if USE_PORTABLE_DATE_ONLY
                new DateOnlyConverter(),
#endif
                new OneOfSerializer(),
                new OptionalJsonConverterFactory(),
            },
#if DEBUG
            WriteIndented = true,
#endif
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                    NullableOptionalModifier,
                    JsonAccessAndIgnoreModifier,
                    HandleExtensionDataFields,
                },
            },
        };
        ConfigureJsonSerializerOptions(options);
        JsonSerializerOptions = options;
    }

    private static void NullableOptionalModifier(JsonTypeInfo typeInfo)
    {
        if (typeInfo.Kind != JsonTypeInfoKind.Object)
            return;

        foreach (var property in typeInfo.Properties)
        {
            var propertyInfo = property.AttributeProvider as global::System.Reflection.PropertyInfo;

            if (propertyInfo is null)
                continue;

            // Check for ReadOnly JsonAccessAttribute - it overrides Optional/Nullable behavior
            var jsonAccessAttribute = propertyInfo.GetCustomAttribute<JsonAccessAttribute>();
            if (jsonAccessAttribute?.AccessType == JsonAccessType.ReadOnly)
            {
                // ReadOnly means "never serialize", which completely overrides Optional/Nullable.
                // Skip Optional/Nullable processing since JsonAccessAndIgnoreModifier
                // will set ShouldSerialize = false anyway.
                continue;
            }
            // Note: WriteOnly doesn't conflict with Optional/Nullable since it only
            // affects deserialization (Set), not serialization (ShouldSerialize)

            var isOptionalType =
                property.PropertyType.IsGenericType
                && property.PropertyType.GetGenericTypeDefinition() == typeof(Optional<>);

            var hasOptionalAttribute =
                propertyInfo.GetCustomAttribute<OptionalAttribute>() is not null;
            var hasNullableAttribute =
                propertyInfo.GetCustomAttribute<NullableAttribute>() is not null;

            if (isOptionalType && hasOptionalAttribute)
            {
                var originalGetter = property.Get;
                if (originalGetter is not null)
                {
                    var capturedIsNullable = hasNullableAttribute;

                    property.ShouldSerialize = (obj, value) =>
                    {
                        var optionalValue = originalGetter(obj);
                        if (optionalValue is not IOptional optional)
                            return false;

                        if (!optional.IsDefined)
                            return false;

                        if (!capturedIsNullable)
                        {
                            var innerValue = optional.GetBoxedValue();
                            if (innerValue is null)
                                return false;
                        }

                        return true;
                    };
                }
            }
            else if (hasNullableAttribute)
            {
                // Force serialization of nullable properties even when null
                property.ShouldSerialize = (obj, value) => true;
            }
        }
    }

    private static void JsonAccessAndIgnoreModifier(JsonTypeInfo typeInfo)
    {
        if (typeInfo.Kind != JsonTypeInfoKind.Object)
            return;

        foreach (var propertyInfo in typeInfo.Properties)
        {
            var jsonAccessAttribute = propertyInfo
                .AttributeProvider?.GetCustomAttributes(typeof(JsonAccessAttribute), true)
                .OfType<JsonAccessAttribute>()
                .FirstOrDefault();

            if (jsonAccessAttribute is not null)
            {
                propertyInfo.IsRequired = false;
                switch (jsonAccessAttribute.AccessType)
                {
                    case JsonAccessType.ReadOnly:
                        propertyInfo.ShouldSerialize = (_, _) => false;
                        break;
                    case JsonAccessType.WriteOnly:
                        propertyInfo.Set = null;
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }

            var jsonIgnoreAttribute = propertyInfo
                .AttributeProvider?.GetCustomAttributes(typeof(JsonIgnoreAttribute), true)
                .OfType<JsonIgnoreAttribute>()
                .FirstOrDefault();

            if (jsonIgnoreAttribute is not null)
            {
                propertyInfo.IsRequired = false;
            }
        }
    }

    private static void HandleExtensionDataFields(JsonTypeInfo typeInfo)
    {
        if (
            typeInfo.Kind == JsonTypeInfoKind.Object
            && typeInfo.Properties.All(prop => !prop.IsExtensionData)
        )
        {
            var extensionProp = typeInfo
                .Type.GetFields(BindingFlags.Instance | BindingFlags.NonPublic)
                .FirstOrDefault(prop =>
                    prop.GetCustomAttribute<JsonExtensionDataAttribute>() is not null
                );

            if (extensionProp is not null)
            {
                var jsonPropertyInfo = typeInfo.CreateJsonPropertyInfo(
                    extensionProp.FieldType,
                    extensionProp.Name
                );
                jsonPropertyInfo.Get = extensionProp.GetValue;
                jsonPropertyInfo.Set = extensionProp.SetValue;
                jsonPropertyInfo.IsExtensionData = true;
                typeInfo.Properties.Add(jsonPropertyInfo);
            }
        }
    }

    static partial void ConfigureJsonSerializerOptions(JsonSerializerOptions defaultOptions);
}

internal static class JsonUtils
{
    internal static string Serialize<T>(T obj) =>
        JsonSerializer.Serialize(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonElement SerializeToElement<T>(T obj) =>
        JsonSerializer.SerializeToElement(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonDocument SerializeToDocument<T>(T obj) =>
        JsonSerializer.SerializeToDocument(obj, JsonOptions.JsonSerializerOptions);

    internal static JsonNode? SerializeToNode<T>(T obj) =>
        JsonSerializer.SerializeToNode(obj, JsonOptions.JsonSerializerOptions);

    internal static byte[] SerializeToUtf8Bytes<T>(T obj) =>
        JsonSerializer.SerializeToUtf8Bytes(obj, JsonOptions.JsonSerializerOptions);

    internal static string SerializeWithAdditionalProperties<T>(
        T obj,
        object? additionalProperties = null
    )
    {
        if (additionalProperties is null)
        {
            return Serialize(obj);
        }
        var additionalPropertiesJsonNode = SerializeToNode(additionalProperties);
        if (additionalPropertiesJsonNode is not JsonObject additionalPropertiesJsonObject)
        {
            throw new InvalidOperationException(
                "The additional properties must serialize to a JSON object."
            );
        }
        var jsonNode = SerializeToNode(obj);
        if (jsonNode is not JsonObject jsonObject)
        {
            throw new InvalidOperationException(
                "The serialized object must be a JSON object to add properties."
            );
        }
        MergeJsonObjects(jsonObject, additionalPropertiesJsonObject);
        return jsonObject.ToJsonString(JsonOptions.JsonSerializerOptions);
    }

    private static void MergeJsonObjects(JsonObject baseObject, JsonObject overrideObject)
    {
        foreach (var property in overrideObject)
        {
            if (!baseObject.TryGetPropertyValue(property.Key, out JsonNode? existingValue))
            {
                baseObject[property.Key] = property.Value is not null
                    ? JsonNode.Parse(property.Value.ToJsonString())
                    : null;
                continue;
            }
            if (
                existingValue is JsonObject nestedBaseObject
                && property.Value is JsonObject nestedOverrideObject
            )
            {
                // If both values are objects, recursively merge them.
                MergeJsonObjects(nestedBaseObject, nestedOverrideObject);
                continue;
            }
            // Otherwise, the overrideObject takes precedence.
            baseObject[property.Key] = property.Value is not null
                ? JsonNode.Parse(property.Value.ToJsonString())
                : null;
        }
    }

    internal static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
}
