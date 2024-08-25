
/// <summary>
/// Tolerant Enum converter. Based on code in the StackOverflow post below.
/// http://stackoverflow.com/questions/22752075/how-can-i-ignore-unknown-enum-values-during-json-deserialization
/// </summary>
internal class TolerantEnumConverter : JsonConverter
{
    public override bool CanConvert(Type objectType)
    {
        Type type = IsNullableType(objectType) ? Nullable.GetUnderlyingType(objectType) : objectType;
        return type.IsEnum;
    }

    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
    {
        bool isNullable = IsNullableType(objectType);
        Type enumType = isNullable ? Nullable.GetUnderlyingType(objectType) : objectType;

        string[] names = Enum.GetNames(enumType);

        if (reader.TokenType == JsonToken.String)
        {
            string enumText = reader.Value.ToString();

            if (!string.IsNullOrEmpty(enumText))
            {
                string match = names
                    .Where(n => string.Equals(n, enumText, StringComparison.OrdinalIgnoreCase))
                    .FirstOrDefault();

                if (match != null)
                {
                    return Enum.Parse(enumType, match);
                }
            }
        }
        else if (reader.TokenType == JsonToken.Integer)
        {
            int enumVal = Convert.ToInt32(reader.Value);
            int[] values = (int[])Enum.GetValues(enumType);
            if (values.Contains(enumVal))
            {
                return Enum.Parse(enumType, enumVal.ToString());
            }
        }

        if (!isNullable)
        {
            string defaultName = names
                .Where(n => string.Equals(n, "Unknown", StringComparison.OrdinalIgnoreCase))
                .FirstOrDefault();

            if (defaultName == null)
            {
                defaultName = names.First();
            }

            return Enum.Parse(enumType, defaultName);
        }

        return null;
    }

    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        writer.WriteValue(value.ToString());
    }

    private bool IsNullableType(Type t)
    {
        return (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Nullable<>));
    }
}

public class StringEnumConverter : JsonConverter<StringEnum>
{
    public override bool CanConvert(Type objectType)
    {
        Type type = IsNullableType(objectType) ? Nullable.GetUnderlyingType(objectType) : objectType;
        return type.IsEnum;
    }

    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
    {
        bool isNullable = IsNullableType(objectType);
    }

    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        writer.WriteValue(value.value.ToString());
    }
}