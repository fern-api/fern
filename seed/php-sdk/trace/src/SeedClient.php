<?php

namespace Seed;

use Seed\V2\V2Client;
use Seed\Admin\AdminClient;
use Seed\Homepage\HomepageClient;
use Seed\Migration\MigrationClient;
use Seed\Playlist\PlaylistClient;
use Seed\Problem\ProblemClient;
use Seed\Submission\SubmissionClient;
use Seed\Sysprop\SyspropClient;
use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient 
{
    /**
     * @var V2Client $v2
     */
    public V2Client $v2;

    /**
     * @var AdminClient $admin
     */
    public AdminClient $admin;

    /**
     * @var HomepageClient $homepage
     */
    public HomepageClient $homepage;

    /**
     * @var MigrationClient $migration
     */
    public MigrationClient $migration;

    /**
     * @var PlaylistClient $playlist
     */
    public PlaylistClient $playlist;

    /**
     * @var ProblemClient $problem
     */
    public ProblemClient $problem;

    /**
     * @var SubmissionClient $submission
     */
    public SubmissionClient $submission;

    /**
     * @var SyspropClient $sysprop
     */
    public SyspropClient $sysprop;

    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options @phpstan-ignore-next-line Property is used in endpoint methods via HttpEndpointGenerator
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param ?string $token The token to use for authentication.
     * @param ?string $xRandomHeader
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?string $token = null,
        ?string $xRandomHeader = null,
        ?array $options = null,
    )
    {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];
        if ($token != null){
            $defaultHeaders['Authorization'] = "Bearer $token";
        }
        if ($xRandomHeader != null){
            $defaultHeaders['X-Random-Header'] = $xRandomHeader;
        }
        
        $this->options = $options ?? [];
        
        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );
        
        $this->client = new RawClient(
            options: $this->options,
        );
        
        $this->v2 = new V2Client($this->client, $this->options);
        $this->admin = new AdminClient($this->client, $this->options);
        $this->homepage = new HomepageClient($this->client, $this->options);
        $this->migration = new MigrationClient($this->client, $this->options);
        $this->playlist = new PlaylistClient($this->client, $this->options);
        $this->problem = new ProblemClient($this->client, $this->options);
        $this->submission = new SubmissionClient($this->client, $this->options);
        $this->sysprop = new SyspropClient($this->client, $this->options);
    }
}
