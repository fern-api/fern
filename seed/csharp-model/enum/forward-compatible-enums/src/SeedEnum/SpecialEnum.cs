using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(StringEnumSerializer<SpecialEnum>))]
[Serializable]
public readonly record struct SpecialEnum : IStringEnum
{
    public static readonly SpecialEnum A = new(Values.A);

    public static readonly SpecialEnum B = new(Values.B);

    public static readonly SpecialEnum C = new(Values.C);

    public static readonly SpecialEnum D = new(Values.D);

    public static readonly SpecialEnum E = new(Values.E);

    public static readonly SpecialEnum F = new(Values.F);

    public static readonly SpecialEnum H = new(Values.H);

    public static readonly SpecialEnum I = new(Values.I);

    public static readonly SpecialEnum J = new(Values.J);

    public static readonly SpecialEnum K = new(Values.K);

    public static readonly SpecialEnum L = new(Values.L);

    public static readonly SpecialEnum M = new(Values.M);

    public static readonly SpecialEnum N = new(Values.N);

    public static readonly SpecialEnum O = new(Values.O);

    public static readonly SpecialEnum P = new(Values.P);

    public static readonly SpecialEnum Q = new(Values.Q);

    public static readonly SpecialEnum R = new(Values.R);

    public static readonly SpecialEnum S = new(Values.S);

    public static readonly SpecialEnum T = new(Values.T);

    public static readonly SpecialEnum U = new(Values.U);

    public static readonly SpecialEnum V = new(Values.V);

    public static readonly SpecialEnum W = new(Values.W);

    public static readonly SpecialEnum X = new(Values.X);

    public static readonly SpecialEnum Y = new(Values.Y);

    public static readonly SpecialEnum Z = new(Values.Z);

    public static readonly SpecialEnum Aa = new(Values.Aa);

    public static readonly SpecialEnum Bb = new(Values.Bb);

    public static readonly SpecialEnum Cc = new(Values.Cc);

    public static readonly SpecialEnum Dd = new(Values.Dd);

    public static readonly SpecialEnum Ee = new(Values.Ee);

    public static readonly SpecialEnum Ff = new(Values.Ff);

    public static readonly SpecialEnum Gg = new(Values.Gg);

    public SpecialEnum(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static SpecialEnum FromCustom(string value)
    {
        return new SpecialEnum(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(SpecialEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(SpecialEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(SpecialEnum value) => value.Value;

    public static explicit operator SpecialEnum(string value) => new(value);

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string A = "";

        public const string B = "Hello \\\"World\\\"";

        public const string C = "Hello 'World'";

        public const string D = "Hello\\\\World";

        public const string E = "Hello\\nWorld";

        public const string F = "Hello\\rWorld";

        public const string H = "Hello\\tWorld";

        public const string I = "Hello\\fWorld";

        public const string J = "Hello\\u0008World";

        public const string K = "Hello\\vWorld";

        public const string L = "Hello\\x00World";

        public const string M = "Hello\\u0007World";

        public const string N = "Hello\\u0001World";

        public const string O = "Hello\\u0002World";

        public const string P = "Hello\\u001FWorld";

        public const string Q = "Hello\\u007FWorld";

        public const string R = "Hello\\u009FWorld";

        public const string S = "Line 1\\n\"Quote\"\\tTab\\\\Backslash\\r\\nLine 2\\0Null";

        public const string T = "\\n\\r\\t\\x00\\u0008\\f\\v\\u0007";

        public const string U = "Hello 世界";

        public const string V = "café";

        public const string W = "🚀";

        public const string X = "\\\\n";

        public const string Y = "\\\\";

        public const string Z = "{\"name\": \"John\", \"age\": 30, \"city\": \"New York\"}";

        public const string Aa = "SELECT * FROM users WHERE name = 'John O\\\\'Reilly'";

        public const string Bb = "C:\\\\Users\\\\John\\\\Documents\\\\file.txt";

        public const string Cc = "/usr/local/bin/app";

        public const string Dd = "\\\\d{3}-\\\\d{2}-\\\\d{4}";

        public const string Ee = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}";

        public const string Ff = "transcript[transcriptType=\"final\"]";

        public const string Gg = "transcript[transcriptType='final']";
    }
}
