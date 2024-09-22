<?php

namespace Seed\File\Service;

use Seed\Core\RawClient;
use Seed\File\Service\Requests\GetFileRequest;
use Seed\Types\Types\File;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;

class ServiceClient
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
     * This endpoint returns a file by its name.
     *
     * @param string $filename This is a filename
     * @param GetFileRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return File
     */
    public function getFile(string $filename, GetFileRequest $request, ?array $options = null): File
    {
        $headers = [];
        $headers['X-File-API-Version'] = $request->xFileApiVersion;
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/file/$filename",
                    method: HttpMethod::GET,
                    headers: $headers,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return File::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
