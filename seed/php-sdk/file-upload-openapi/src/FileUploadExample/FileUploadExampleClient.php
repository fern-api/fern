<?php

namespace Seed\FileUploadExample;

use GuzzleHttp\ClientInterface;
use Seed\Core\Client\RawClient;
use Seed\FileUploadExample\Requests\UploadFileRequest;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Multipart\MultipartFormData;
use Seed\Core\Multipart\MultipartApiRequest;
use Seed\Core\Client\HttpMethod;
use Seed\Core\Json\JsonDecoder;
use JsonException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Client\ClientExceptionInterface;

class FileUploadExampleClient
{
    /**
     * @var array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    private array $options;

    /**
     * @var RawClient $client
     */
    private RawClient $client;

    /**
     * @param RawClient $client
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        RawClient $client,
        ?array $options = null,
    ) {
        $this->client = $client;
        $this->options = $options ?? [];
    }

    /**
     * Upload a file to the database
     *
     * @param UploadFileRequest $request
     * @param ?array{
     *   baseUrl?: string,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   queryParameters?: array<string, mixed>,
     * } $options
     * @return string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function uploadFile(UploadFileRequest $request, ?array $options = null): string
    {
        $options = array_merge($this->options, $options ?? []);
        $body = new MultipartFormData();
        $body->add(name: 'name', value: $request->name);
        if ($request->file != null) {
            $body->addPart($request->file->toMultipartFormDataPart('file'));
        }
        try {
            $response = $this->client->sendRequest(
                new MultipartApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "upload-file",
                    method: HttpMethod::POST,
                    body: $body,
                ),
                $options,
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeString($json);
            }
        } catch (JsonException $e) {
            throw new SeedException(message: "Failed to deserialize response: {$e->getMessage()}", previous: $e);
        } catch (RequestException $e) {
            $response = $e->getResponse();
            if ($response === null) {
                throw new SeedException(message: $e->getMessage(), previous: $e);
            }
            throw new SeedApiException(
                message: "API request failed",
                statusCode: $response->getStatusCode(),
                body: $response->getBody()->getContents(),
            );
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
