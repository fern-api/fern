using System.Text.Json.Serialization;

namespace <%= namespace%>

[JsonConverter(typeof(TolerantEnumConverter))]
internal class StringEnum<T> where T : System.Enum
{
    public readonly T value;
    public readonly String _raw;
}
