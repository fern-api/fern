using System.Text.Json.Serialization;

namespace SeedInferredAuthImplicit.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
