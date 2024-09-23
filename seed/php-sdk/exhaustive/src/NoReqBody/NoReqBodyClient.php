<?php

namespace Seed\NoReqBody;

use Seed\Core\RawClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Core\JsonDecoder;

class NoReqBodyClient
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
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return ObjectWithOptionalField
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getWithNoRequestBody(?array $options = null): ObjectWithOptionalField
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/no-req-body",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return ObjectWithOptionalField::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function postWithNoRequestBody(?array $options = null): string
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/no-req-body",
                    method: HttpMethod::POST,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeString($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
