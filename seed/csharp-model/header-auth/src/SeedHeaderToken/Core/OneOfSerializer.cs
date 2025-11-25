using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;

namespace SeedHeaderToken.Core;

internal class OneOfSerializer : JsonConverter<IOneOf>
{
    public override IOneOf? Read(
        ref Utf8JsonReader reader,
        global::System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType is JsonTokenType.Null)
            return default;

        foreach (var (type, cast) in GetOneOfTypes(typeToConvert))
        {
            try
            {
                var readerCopy = reader;
                var result = JsonSerializer.Deserialize(ref readerCopy, type, options);
                reader.Skip();
                return (IOneOf)cast.Invoke(null, [result])!;
            }
            catch (JsonException) { }
        }

        throw new JsonException(
            $"Cannot deserialize into one of the supported types for {typeToConvert}"
        );
    }

    public override void Write(Utf8JsonWriter writer, IOneOf value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value.Value, options);
    }

    private static (global::System.Type type, MethodInfo cast)[] GetOneOfTypes(
        global::System.Type typeToConvert
    )
    {
        var type = typeToConvert;
        if (Nullable.GetUnderlyingType(type) is { } underlyingType)
        {
            type = underlyingType;
        }

        var casts = type.GetRuntimeMethods()
            .Where(m => m.IsSpecialName && m.Name == "op_Implicit")
            .ToArray();
        while (type != null)
        {
            if (
                type.IsGenericType
                && (type.Name.StartsWith("OneOf`") || type.Name.StartsWith("OneOfBase`"))
            )
            {
                var genericArguments = type.GetGenericArguments();
                if (genericArguments.Length == 1)
                {
                    return [(genericArguments[0], casts[0])];
                }

                // if object type is present, make sure it is last
                var indexOfObjectType = Array.IndexOf(genericArguments, typeof(object));
                if (indexOfObjectType != -1 && genericArguments.Length - 1 != indexOfObjectType)
                {
                    genericArguments = genericArguments
                        .OrderBy(t => t == typeof(object) ? 1 : 0)
                        .ToArray();
                }

                return genericArguments
                    .Select(t => (t, casts.First(c => c.GetParameters()[0].ParameterType == t)))
                    .ToArray();
            }

            type = type.BaseType;
        }

        throw new InvalidOperationException($"{type} isn't OneOf or OneOfBase");
    }

    public override bool CanConvert(global::System.Type typeToConvert)
    {
        return typeof(IOneOf).IsAssignableFrom(typeToConvert);
    }
}
