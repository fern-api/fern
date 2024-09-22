<?php

namespace Seed\Migration;

use Seed\Core\RawClient;
use Seed\Migration\Requests\GetAttemptedMigrationsRequest;
use Seed\Migration\Types\Migration;
use Seed\Core\JsonApiRequest;
use Seed\Environments;
use Seed\Core\HttpMethod;
use Seed\Core\JsonDecoder;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class MigrationClient
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
     * @param GetAttemptedMigrationsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return array<Migration>
     */
    public function getAttemptedMigrations(GetAttemptedMigrationsRequest $request, ?array $options = null): array
    {
        $headers = [];
        $headers['admin-key-header'] = $request->adminKeyHeader;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/migration-info/all",
                    method: HttpMethod::GET,
                    headers: $headers,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [Migration::class]); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
