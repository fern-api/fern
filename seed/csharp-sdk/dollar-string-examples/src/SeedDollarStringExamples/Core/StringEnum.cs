using global::System.Text.Json.Serialization;

namespace SeedDollarStringExamples.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
