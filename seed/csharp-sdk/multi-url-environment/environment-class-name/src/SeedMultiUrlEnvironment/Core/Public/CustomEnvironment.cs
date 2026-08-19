namespace SeedMultiUrlEnvironment;

[Serializable]
public class CustomEnvironment
{
    public static readonly CustomEnvironment Production = new CustomEnvironment
    {
        Ec2 = "https://ec2.aws.com",
        S3 = "https://s3.aws.com",
    };

    public static readonly CustomEnvironment Staging = new CustomEnvironment
    {
        Ec2 = "https://staging.ec2.aws.com",
        S3 = "https://staging.s3.aws.com",
    };

    /// <summary>
    /// URL for the ec2 service
    /// </summary>
    public string Ec2 { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }

    /// <summary>
    /// URL for the s3 service
    /// </summary>
    public string S3 { get;
#if NET5_0_OR_GREATER
        init;
#else
        set;
#endif
    }
}
