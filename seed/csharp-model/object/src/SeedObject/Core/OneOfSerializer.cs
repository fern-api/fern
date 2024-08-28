using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;

namespace SeedObject.Core;

internal class OneOfSerializer : JsonConverter<IOneOf>
{
    public override IOneOf? Read(
        ref Utf8JsonReader reader,
        System.Type typeToConvert,
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

    private static (System.Type type, MethodInfo cast)[] GetOneOfTypes(System.Type typeToConvert)
    {
        var casts = typeToConvert
            .GetRuntimeMethods()
            .Where(m => m.IsSpecialName && m.Name == "op_Implicit")
            .ToArray();
        var type = typeToConvert;
        while (type != null)
        {
            if (
                type.IsGenericType
                && (type.Name.StartsWith("OneOf`") || type.Name.StartsWith("OneOfBase`"))
            )
            {
                return type.GetGenericArguments()
                    .Select(t => (t, casts.First(c => c.GetParameters()[0].ParameterType == t)))
                    .ToArray();
            }

            type = type.BaseType;
        }
        throw new InvalidOperationException($"{type} isn't OneOf or OneOfBase");
    }

    public override bool CanConvert(System.Type typeToConvert)
    {
        return typeof(IOneOf).IsAssignableFrom(typeToConvert);
    }
}
