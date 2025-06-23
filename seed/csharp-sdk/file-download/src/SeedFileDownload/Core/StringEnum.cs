using System.Text.Json.Serialization;

namespace SeedFileDownload.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
