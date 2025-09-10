using System.Text.Json.Serialization;

namespace SeedMultiLineDocs.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
