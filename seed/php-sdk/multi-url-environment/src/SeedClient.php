<?php

namespace Seed;

use Seed\Ec2\Ec2Client;
use Seed\S3\S3Client;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var Ec2Client $ec2
     */
    public Ec2Client $ec2;

    /**
     * @var S3Client $s3
     */
    public S3Client $s3;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param string $token The token to use for authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        string $token,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'Authorization' => "Bearer $token",
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->ec2 = new Ec2Client($this->client, $this->options);
        $this->s3 = new S3Client($this->client, $this->options);
    }
}
