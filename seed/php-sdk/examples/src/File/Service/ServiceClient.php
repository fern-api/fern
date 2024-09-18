<?php

namespace Seed\File\Service;

use Seed\Core\RawClient;
use Seed\File\Service\Requests\GetFileRequest;
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
     * @param string filename This is a filename
     * @param GetFileRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getFile(string $filename, GetFileRequest $request, ?array $options = null): mixed
    {
        $headers = [];
        $headers['X-File-API-Version'] = request->xFileApiVersion;
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
