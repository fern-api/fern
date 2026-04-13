<?php

namespace Seed;

use Seed\Ab\AbClient;
use Seed\Ac\AcClient;
use Seed\Folder\FolderClient;
use Seed\FolderService\FolderServiceClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Ab\AbClientInterface;
use Seed\Ac\AcClientInterface;
use Seed\Folder\FolderClientInterface;
use Seed\FolderService\FolderServiceClientInterface;

class SeedClient implements SeedClientInterface
{
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
    ) {
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

        $this->ab = new AbClient($this->client, $this->options);
        $this->ac = new AcClient($this->client, $this->options);
        $this->folder = new FolderClient($this->client, $this->options);
        $this->folderService = new FolderServiceClient($this->client, $this->options);
    }

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function foo(?array $options = null): void
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "",
                    method: HttpMethod::POST,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }

    /**
     * @return AbClientInterface
     */
    public function getAb(): AbClientInterface
    {
        return $this->ab;
    }

    /**
     * @return AcClientInterface
     */
    public function getAc(): AcClientInterface
    {
        return $this->ac;
    }

    /**
     * @return FolderClientInterface
     */
    public function getFolder(): FolderClientInterface
    {
        return $this->folder;
    }

    /**
     * @return FolderServiceClientInterface
     */
    public function getFolderService(): FolderServiceClientInterface
    {
        return $this->folderService;
    }
}
