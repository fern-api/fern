using global::System.Reflection;
using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using global::System.Text.Json.Serialization.Metadata;

namespace SeedApi.Core;

internal static partial class JsonOptions
{
    internal static readonly JsonSerializerOptions JsonSerializerOptions;

    static JsonOptions()
    {
        var options = new JsonSerializerOptions
        {
            Converters = { new DateTimeSerializer(),
#if USE_PORTABLE_DATE_ONLY
                new DateOnlyConverter(),
#endif
                new OneOfSerializer() },
#if DEBUG
            WriteIndented = true,
#endif
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            TypeInfoResolver = new DefaultJsonTypeInfoResolver
            {
                Modifiers =
                {
                    static typeInfo =>
                    {
                        if (typeInfo.Kind != JsonTypeInfoKind.Object)
                            return;

                        foreach (var propertyInfo in typeInfo.Properties)
                        {
                            var jsonAccessAttribute = propertyInfo
                                .AttributeProvider?.GetCustomAttributes(
                                    typeof(JsonAccessAttribute),
                                    true
                                )
                                .OfType<JsonAccessAttribute>()
                                .FirstOrDefault();

                            if (jsonAccessAttribute != null)
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
                                .AttributeProvider?.GetCustomAttributes(
                                    typeof(JsonIgnoreAttribute),
                                    true
                                )
                                .OfType<JsonIgnoreAttribute>()
                                .FirstOrDefault();

                            if (jsonIgnoreAttribute is not null)
                            {
                                propertyInfo.IsRequired = false;
                            }
                        }

                        if (
                            typeInfo.Kind == JsonTypeInfoKind.Object
                            && typeInfo.Properties.All(prop => !prop.IsExtensionData)
                        )
                        {
                            var extensionProp = typeInfo
                                .Type.GetFields(BindingFlags.Instance | BindingFlags.NonPublic)
                                .FirstOrDefault(prop =>
                                    prop.GetCustomAttribute<JsonExtensionDataAttribute>() != null
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
                    },
                },
            },
        };
        ConfigureJsonSerializerOptions(options);
        JsonSerializerOptions = options;
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
        if (additionalProperties == null)
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
                baseObject[property.Key] =
                    property.Value != null ? JsonNode.Parse(property.Value.ToJsonString()) : null;
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
            baseObject[property.Key] =
                property.Value != null ? JsonNode.Parse(property.Value.ToJsonString()) : null;
        }
    }

    internal static T Deserialize<T>(string json) =>
        JsonSerializer.Deserialize<T>(json, JsonOptions.JsonSerializerOptions)!;
}
