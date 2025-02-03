<?php

namespace Fern\Imdb;

use Fern\Core\Client\RawClient;
use Fern\Imdb\Types\CreateMovieRequest;
use Fern\Exceptions\SeedException;
use Fern\Exceptions\SeedApiException;
use Fern\Core\Json\JsonApiRequest;
use Fern\Core\Client\HttpMethod;
use Fern\Core\Json\JsonDecoder;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Fern\Imdb\Types\Movie;

class ImdbClient
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
     * Add a movie to the database
     *
     * @param CreateMovieRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return string
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createMovie(CreateMovieRequest $request, ?array $options = null): string
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movies/create-movie",
                    method: HttpMethod::POST,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeString($json);
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

    /**
     * @param string $movieId
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return Movie
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getMovie(string $movieId, ?array $options = null): Movie
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movies/$movieId",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return Movie::fromJson($json);
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
