<?php

namespace Seed;

/**
 * Represents the available environments for the API with multiple base URLs.
 */
class Environments 
{
    /**
     * @var string $ec2
     */
    public readonly string $ec2;

    /**
     * @var string $s3
     */
    public readonly string $s3;

    /**
     * @param string $ec2 The ec2 base URL
     * @param string $s3 The s3 base URL
     */
    private function __construct(
        string $ec2,
        string $s3,
    )
    {
        $this->ec2 = $ec2;
        $this->s3 = $s3;
    }

    /**
     * Production environment
     *
     * @return Environments
     */
    public static function Production(): Environments {
        return new self(
            ec2: 'https://ec2.aws.com',
            s3: 'https://s3.aws.com'
        );
    }

    /**
     * Staging environment
     *
     * @return Environments
     */
    public static function Staging(): Environments {
        return new self(
            ec2: 'https://staging.ec2.aws.com',
            s3: 'https://staging.s3.aws.com'
        );
    }

    /**
     * Create a custom environment with your own URLs
     *
     * @param string $ec2 The ec2 base URL
     * @param string $s3 The s3 base URL
     * @return Environments
     */
    public static function custom(string $ec2, string $s3): Environments {
        return new self(
            ec2: $ec2,
            s3: $s3
        );
    }
}
