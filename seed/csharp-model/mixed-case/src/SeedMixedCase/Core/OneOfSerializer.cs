using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;

namespace SeedMixedCase.Core;

public class OneOfSerializer<TOneOf> : JsonConverter<TOneOf>
    where TOneOf : IOneOf
{
    public override TOneOf? Read(
        ref Utf8JsonReader reader,
        System.Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.TokenType is JsonTokenType.Null)
            return default;

        foreach (var (type, cast) in s_types)
        {
            try
            {
                var readerCopy = reader;
                var result = JsonSerializer.Deserialize(ref readerCopy, type, options);
                reader.Skip();
                return (TOneOf)cast.Invoke(null, [result])!;
            }
            catch (JsonException) { }
        }

        throw new JsonException(
            $"Cannot deserialize into one of the supported types for {typeToConvert}"
        );
    }

    private static readonly (System.Type type, MethodInfo cast)[] s_types = GetOneOfTypes();

    public override void Write(Utf8JsonWriter writer, TOneOf value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value.Value, options);
    }

    private static (System.Type type, MethodInfo cast)[] GetOneOfTypes()
    {
        var casts = typeof(TOneOf)
            .GetRuntimeMethods()
            .Where(m => m.IsSpecialName && m.Name == "op_Implicit")
            .ToArray();
        var type = typeof(TOneOf);
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
        throw new InvalidOperationException($"{typeof(TOneOf)} isn't OneOf or OneOfBase");
    }
}
