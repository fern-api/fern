<?php

namespace Seed\Imdb;

use Seed\Core\JsonDecoder;
use Seed\Core\JsonSerializer;
use Seed\Core\RawClient;
use Seed\Imdb\Types\CreateMovieRequest;
use Seed\Core\JsonApiRequest;
use Seed\Core\HttpMethod;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Imdb\Types\Movie;

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
     * @param CreateMovieRequest $request
     * @param ?array{baseUrl?: string} $options
     * @returns Movie
     * @throws Exception
     */
    public function createMovie(CreateMovieRequest $request, ?array $options = null): Movie
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movies/create-movie",
                    method: HttpMethod::POST,
                    body: $request,                                      // object or primitive
//                    body: JsonSerializer::serializeDateTime($request), // datetime
//                    body: JsonSerializer::serializeDate($request),     // date
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return Movie::fromJson($response->getBody()->getContents());               // object
//                return JsonDecoder::decodeDate($response->getBody()->getContents());     // date
//                return JsonDecoder::decodeDatetime($response->getBody()->getContents()); // datetime
//                return JsonDecoder::decodeBoolean($response->getBody()->getContents());  // boolean
//                                                                                         // ... other primitives
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * Add a movie to the database
     * @param array<CreateMovieRequest> $request
     * @param ?array{baseUrl?: string} $options
     * @returns Movie[]
     * @throws Exception
     */
    public function createMovieList(array $request, ?array $options = null): array
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movies/create-movie",
                    method: HttpMethod::POST,
                    body: JsonSerializer::serializeArray($request, [CreateMovieRequest::class]),
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return JsonDecoder::jsonToDeserializedArray($response->getBody()->getContents(), [Movie::class]);
            }
        } catch (JsonException $e) {
            throw new Exception("Failed to deserialize response", 0, $e);
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

    /**
     * @param string $movieId
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getMovie(string $movieId, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? '',
                    path: "/movies/$movieId",
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
