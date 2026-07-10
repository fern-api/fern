<?php

namespace Seed;

use Seed\Imdb\ImdbClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;

class SeedClient
{
    /**
     * @var ImdbClient $imdb
     */
    public ImdbClient $imdb;

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
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => self::getPlatformUserAgent(strtolower(PHP_OS), php_uname('m'), PHP_VERSION),
        ];
        if ($token != null) {
            $defaultHeaders['Authorization'] = "Bearer $token";
        }

        $this->options = $options ?? [];

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->imdb = new ImdbClient($this->client, $this->options);
    }

    /**
     * @param string $os
     * @param string $arch
     * @param string $runtimeVersion
     * @return string
     */
    private static function getPlatformUserAgent(string $os, string $arch, string $runtimeVersion): string
    {
        $arch = in_array(strtolower($arch), ['x64', 'amd64', 'x86_64'], true) ? 'x86_64' : $arch;
        $segments = array_values(array_filter([$os, $arch], fn ($value) => $value !== ''));
        $platform = count($segments) > 0 ? ' (' . implode('; ', $segments) . ')' : '';
        $runtime = $runtimeVersion !== '' ? 'PHP/' . $runtimeVersion : 'PHP';
        return 'seed/seed/0.0.1' . $platform . ' ' . $runtime;
    }
}
