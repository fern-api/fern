<?php

namespace Seed;

use Seed\\Client;
use Seed\Ab\AbClient;
use Seed\Ac\AcClient;
use Seed\Folder\FolderClient;
use Seed\FolderService\FolderServiceClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient 
{
    /**
     * @var Client $
     */
    public Client $;

    /**
     * @var AbClient $ab
     */
    public AbClient $ab;

    /**
     * @var AcClient $ac
     */
    public AcClient $ac;

    /**
     * @var FolderClient $folder
     */
    public FolderClient $folder;

    /**
     * @var FolderServiceClient $folderService
     */
    public FolderServiceClient $folderService;

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
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        ?array $options = null,
    )
    {
        $defaultHeaders = [
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
        
        $this-> = new Client($this->client, $this->options);
        $this->ab = new AbClient($this->client, $this->options);
        $this->ac = new AcClient($this->client, $this->options);
        $this->folder = new FolderClient($this->client, $this->options);
        $this->folderService = new FolderServiceClient($this->client, $this->options);
    }
}
