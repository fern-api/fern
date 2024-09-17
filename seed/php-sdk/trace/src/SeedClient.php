<?php

namespace Seed;

use GuzzleHttp\ClientInterface;
use Seed\Core\RawClient;
use Seed\V2\V2Client;
use Seed\Admin\AdminClient;
use Seed\Commons\CommonsClient;
use Seed\Homepage\HomepageClient;
use Seed\LangServer\LangServerClient;
use Seed\Migration\MigrationClient;
use Seed\Playlist\PlaylistClient;
use Seed\Problem\ProblemClient;
use Seed\Submission\SubmissionClient;
use Seed\Sysprop\SyspropClient;
use GuzzleHttp\Client;

class SeedClient
{
    /**
     * @var ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    private ?array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @var V2Client $v2
     */
    public V2Client $v2;

    /**
     * @var AdminClient $admin
     */
    public AdminClient $admin;

    /**
     * @var CommonsClient $commons
     */
    public CommonsClient $commons;

    /**
     * @var HomepageClient $homepage
     */
    public HomepageClient $homepage;

    /**
     * @var LangServerClient $langServer
     */
    public LangServerClient $langServer;

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
     * @param ?array{baseUrl?: string, client?: ClientInterface} $options
     */
    public function __construct(
        ?array $options = null,
    ) {
        $defaultHeaders = [
            "X-Random-Header" => $xRandomHeader,
            "X-Fern-Language" => "PHP",
            "X-Fern-SDK-Name" => "Seed",
            "X-Fern-SDK-Version" => "0.0.1",
        ];
        $this->options = $options ?? [];
        $this->client = new RawClient(client: $this->options['client'] ?? new Client(), headers: $defaultHeaders);
        $this->v2 = new V2Client($this->client);
        $this->admin = new AdminClient($this->client);
        $this->commons = new CommonsClient($this->client);
        $this->homepage = new HomepageClient($this->client);
        $this->langServer = new LangServerClient($this->client);
        $this->migration = new MigrationClient($this->client);
        $this->playlist = new PlaylistClient($this->client);
        $this->problem = new ProblemClient($this->client);
        $this->submission = new SubmissionClient($this->client);
        $this->sysprop = new SyspropClient($this->client);
    }
}
