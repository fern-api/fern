using global::System.Text.Json.Serialization;
using SeedApi.Core;
using global::System.Text.Json;

namespace SeedApi;

[JsonConverter(typeof(SpecialEnum.SpecialEnumSerializer))][Serializable]
public readonly record struct SpecialEnum : IStringEnum
{
    public static readonly SpecialEnum Empty = new(Values.Empty);

    public static readonly SpecialEnum HelloWorld = new(Values.HelloWorld);

    public static readonly SpecialEnum HelloNWorld = new(Values.HelloNWorld);

    public static readonly SpecialEnum HelloRWorld = new(Values.HelloRWorld);

    public static readonly SpecialEnum HelloTWorld = new(Values.HelloTWorld);

    public static readonly SpecialEnum HelloFWorld = new(Values.HelloFWorld);

    public static readonly SpecialEnum HelloU0008World = new(Values.HelloU0008World);

    public static readonly SpecialEnum HelloVWorld = new(Values.HelloVWorld);

    public static readonly SpecialEnum HelloX00World = new(Values.HelloX00World);

    public static readonly SpecialEnum HelloU0007World = new(Values.HelloU0007World);

    public static readonly SpecialEnum HelloU0001World = new(Values.HelloU0001World);

    public static readonly SpecialEnum HelloU0002World = new(Values.HelloU0002World);

    public static readonly SpecialEnum HelloU001FWorld = new(Values.HelloU001FWorld);

    public static readonly SpecialEnum HelloU007FWorld = new(Values.HelloU007FWorld);

    public static readonly SpecialEnum HelloU009FWorld = new(Values.HelloU009FWorld);

    public static readonly SpecialEnum Line1NQuoteTTabBackslashRnLine20Null = new(Values.Line1NQuoteTTabBackslashRnLine20Null);

    public static readonly SpecialEnum Nrtx00U0008Fvu0007 = new(Values.Nrtx00U0008Fvu0007);

    public static readonly SpecialEnum Hello世界 = new(Values.Hello世界);

    public static readonly SpecialEnum Cafe = new(Values.Cafe);

    public static readonly SpecialEnum 🚀 = new(Values.🚀);

    public static readonly SpecialEnum N = new(Values.N);

    public static readonly SpecialEnum _ = new(Values._);

    public static readonly SpecialEnum NameJohnAge30CityNewYork = new(Values.NameJohnAge30CityNewYork);

    public static readonly SpecialEnum SelectFromUsersWhereNameJohnOReilly = new(Values.SelectFromUsersWhereNameJohnOReilly);

    public static readonly SpecialEnum CUsersJohnDocumentsFileTxt = new(Values.CUsersJohnDocumentsFileTxt);

    public static readonly SpecialEnum UsrLocalBinApp = new(Values.UsrLocalBinApp);

    public static readonly SpecialEnum D3D2D4 = new(Values.D3D2D4);

    public static readonly SpecialEnum Azaz09Azaz09Azaz2 = new(Values.Azaz09Azaz09Azaz2);

    public static readonly SpecialEnum TranscriptTranscriptTypeFinal = new(Values.TranscriptTranscriptTypeFinal);

    public SpecialEnum (string value){
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static SpecialEnum FromCustom(string value) {
        return new SpecialEnum(value);
    }

    public bool Equals(string? other) {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString() {
        return Value;
    }

    public static bool operator ==(SpecialEnum value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(SpecialEnum value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(SpecialEnum value) => value.Value;

    public static explicit operator SpecialEnum(string value) => new(value);

    internal class SpecialEnumSerializer : JsonConverter<SpecialEnum>
    {
        public override SpecialEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
            var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");
            return new SpecialEnum(stringValue);
        }

        public override void Write(Utf8JsonWriter writer, SpecialEnum value, JsonSerializerOptions options) {
            writer.WriteStringValue(value.Value);
        }

        public override SpecialEnum ReadAsPropertyName(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
            var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON property name could not be read as a string.");
            return new SpecialEnum(stringValue);
        }

        public override void WriteAsPropertyName(Utf8JsonWriter writer, SpecialEnum value, JsonSerializerOptions options) {
            writer.WritePropertyName(value.Value);
        }

    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Empty = "";

        public const string HelloWorld = "Hello \\\"World\\\"";

        public const string HelloNWorld = "Hello\\nWorld";

        public const string HelloRWorld = "Hello\\rWorld";

        public const string HelloTWorld = "Hello\\tWorld";

        public const string HelloFWorld = "Hello\\fWorld";

        public const string HelloU0008World = "Hello\\u0008World";

        public const string HelloVWorld = "Hello\\vWorld";

        public const string HelloX00World = "Hello\\x00World";

        public const string HelloU0007World = "Hello\\u0007World";

        public const string HelloU0001World = "Hello\\u0001World";

        public const string HelloU0002World = "Hello\\u0002World";

        public const string HelloU001FWorld = "Hello\\u001FWorld";

        public const string HelloU007FWorld = "Hello\\u007FWorld";

        public const string HelloU009FWorld = "Hello\\u009FWorld";

        public const string Line1NQuoteTTabBackslashRnLine20Null = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null";

        public const string Nrtx00U0008Fvu0007 = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007";

        public const string Hello世界 = "Hello 世界";

        public const string Cafe = "café";

        public const string 🚀 = "🚀";

        public const string N = "\\\\n";

        public const string _ = "\\\\";

        public const string NameJohnAge30CityNewYork = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}";

        public const string SelectFromUsersWhereNameJohnOReilly = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'";

        public const string CUsersJohnDocumentsFileTxt = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt";

        public const string UsrLocalBinApp = "/usr/local/bin/app";

        public const string D3D2D4 = "\\\\d{3}-\\\\d{2}-\\\\d{4}";

        public const string Azaz09Azaz09Azaz2 = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}";

        public const string TranscriptTranscriptTypeFinal = "transcript[transcriptType=\"final\"]";
    }

}
