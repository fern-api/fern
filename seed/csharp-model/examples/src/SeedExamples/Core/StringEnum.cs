using System.Text.Json.Serialization;

namespace SeedExamples.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
