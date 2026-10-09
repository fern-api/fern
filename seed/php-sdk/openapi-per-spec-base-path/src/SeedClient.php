<?php

namespace Seed;

use Seed\Oauth\OauthClient;
use Psr\Http\Client\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\Core\OAuthTokenProvider;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Json\JsonDecoder;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class SeedClient
{
    /**
     * @var OauthClient $oauth
     */
    public OauthClient $oauth;

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
     * @var OAuthTokenProvider $oauthTokenProvider
     */
    private OAuthTokenProvider $oauthTokenProvider;

    /**
     * @param string $clientId The client ID for OAuth authentication.
     * @param string $clientSecret The client secret for OAuth authentication.
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        string $clientId,
        string $clientSecret,
        ?array $options = null,
    ) {
        $defaultHeaders = [
            'X-Fern-Language' => 'PHP',
            'X-Fern-SDK-Name' => 'Seed',
            'X-Fern-SDK-Version' => '0.0.1',
            'User-Agent' => 'seed/seed/0.0.1',
        ];

        $this->options = $options ?? [];

        $authRawClient = new RawClient(isset($this->options['baseUrl']) ? ['baseUrl' => $this->options['baseUrl'], 'headers' => []] : ['headers' => []]);
        $authClient = new OauthClient($authRawClient);
        $this->oauthTokenProvider = new OAuthTokenProvider($clientId ?? '', $clientSecret ?? '', $authClient);

        $this->options['headers'] = array_merge(
            $defaultHeaders,
            $this->options['headers'] ?? [],
        );

        $this->options['getAuthHeaders'] = fn () =>
            ['Authorization' => "Bearer " . $this->oauthTokenProvider->getToken()];

        $this->client = new RawClient(
            options: $this->options,
        );

        $this->oauth = new OauthClient($this->client, $this->options);
    }

    /**
     * Example:
     * ```php
     * $client->listItems();
     * ```
     *
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     *   bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?array<string>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function listItems(?array $options = null): ?array
    {
        $options = array_merge($this->options, $options ?? []);
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "api/v3/items",
                    method: HttpMethod::GET,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return JsonDecoder::decodeArray($json, ['string']); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (ClientExceptionInterface $e) {
            throw new SeedException(message: $e->getMessage(), previous: $e);
        }
        throw new SeedApiException(
            message: 'API request failed',
            statusCode: $statusCode,
            body: $response->getBody()->getContents(),
        );
    }
}
