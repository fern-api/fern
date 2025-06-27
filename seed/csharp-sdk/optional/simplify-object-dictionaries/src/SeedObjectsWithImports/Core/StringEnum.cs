using System.Text.Json.Serialization;

namespace SeedObjectsWithImports.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
