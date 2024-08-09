using System;
using SeedMultiUrlEnvironment.Core;

#nullable enable

namespace SeedMultiUrlEnvironment;

internal partial class SeedMultiUrlEnvironmentClient
{
    public SeedMultiUrlEnvironmentClient(string? token = null, ClientOptions? clientOptions = null)
    {
        _client = new RawClient(
            new Dictionary<string, string>()
            {
                { "Authorization", $"Bearer {token}" },
                { "X-Fern-Language", "C#" },
            },
            new Dictionary<string, Func<string>>() { },
            clientOptions ?? new ClientOptions()
        );
        Ec2 = new Ec2Client(_client);
        S3 = new S3Client(_client);
    }

    public RawClient _client;

    public Ec2Client Ec2 { get; init; }

    public S3Client S3 { get; init; }
}
