<?php

namespace Seed\Sysprop;

use Seed\Core\RawClient;
use Seed\Commons\Types\Language;
use Seed\Core\JsonApiRequest;
use Seed\Environments;
use Seed\Core\HttpMethod;
use Psr\Http\Client\ClientExceptionInterface;
use Exception;
use JsonException;

class SyspropClient
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
     * @param Language $language
     * @param int $numWarmInstances
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function setNumWarmInstances(Language $language, int $numWarmInstances, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/sysprop/num-warm-instances/$language/$numWarmInstances",
                    method: HttpMethod::PUT,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getNumWarmInstances(?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/sysprop/num-warm-instances",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return json_decode($response->getBody()->getContents(), true, 512, JSON_THROW_ON_ERROR);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
