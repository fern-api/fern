<?php

namespace Seed\Endpoints\Object;

use Seed\Core\RawClient;
use Seed\Types\Object\Types\ObjectWithOptionalField;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Types\Object\Types\ObjectWithRequiredField;
use Seed\Types\Object\Types\ObjectWithMapOfMap;
use Seed\Types\Object\Types\NestedObjectWithOptionalField;
use Seed\Types\Object\Types\NestedObjectWithRequiredField;

class ObjectClient
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
     * @param ObjectWithOptionalField $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnWithOptionalField(ObjectWithOptionalField $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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

    /**
     * @param ObjectWithRequiredField $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnWithRequiredField(ObjectWithRequiredField $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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

    /**
     * @param ObjectWithMapOfMap $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnWithMapOfMap(ObjectWithMapOfMap $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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

    /**
     * @param NestedObjectWithOptionalField $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnNestedWithOptionalField(NestedObjectWithOptionalField $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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

    /**
     * @param string $string
     * @param NestedObjectWithRequiredField $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnNestedWithRequiredField(string $string, NestedObjectWithRequiredField $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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

    /**
     * @param array<NestedObjectWithRequiredField> $request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getAndReturnNestedWithRequiredFieldAsList(array $request, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
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
