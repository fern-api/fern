<?php

namespace Seed\CustomAuth;

use Seed\Core\RawClient;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use Seed\Core\JsonDecoder;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;

class CustomAuthClient
{
    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     */
    public function __construct(
        RawClient $client,
    ) {
        $this->client = $client;
    }

    /**
     * GET request with custom auth scheme
     *
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return bool
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getWithCustomAuth(?array $options = null): bool
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "custom-auth",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeBool($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * POST request with custom auth scheme
     *
     * @param mixed $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return bool
     * @throws SeedException
     * @throws SeedApiException
     */
    public function postWithCustomAuth(mixed $request, ?array $options = null): bool
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "custom-auth",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeBool($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
