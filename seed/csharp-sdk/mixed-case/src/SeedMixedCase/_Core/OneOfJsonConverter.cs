namespace SeedMixedCase.Core            

[JsonConverter(typeof(StringEnumConverter))]
public class StringEnum<T> where T : System.Enum
{
    public readonly T value;
    public readonly String _raw;
}

            