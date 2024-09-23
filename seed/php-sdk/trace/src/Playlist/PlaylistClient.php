<?php

namespace Seed\Playlist;

use Seed\Core\RawClient;
use Seed\Playlist\Requests\CreatePlaylistRequest;
use Seed\Playlist\Types\Playlist;
use Seed\Exceptions\SeedException;
use Seed\Exceptions\SeedApiException;
use Seed\Core\Constant;
use Seed\Core\JsonApiRequest;
use Seed\Environments;
use Seed\Core\HttpMethod;
use JsonException;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Playlist\Requests\GetPlaylistsRequest;
use Seed\Core\JsonDecoder;
use Seed\Playlist\Types\UpdatePlaylistRequest;

class PlaylistClient
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
     * Create a new playlist
     *
     * @param int $serviceParam
     * @param CreatePlaylistRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return Playlist
     * @throws SeedException
     * @throws SeedApiException
     */
    public function createPlaylist(int $serviceParam, CreatePlaylistRequest $request, ?array $options = null): Playlist
    {
        $query = [];
        $query['datetime'] = $request->datetime->format(Constant::DateTimeFormat);
        if ($request->optionalDatetime != null) {
            $query['optionalDatetime'] = $request->optionalDatetime;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/v2/playlist/$serviceParam/create",
                    method: HttpMethod::POST,
                    query: $query,
                    body: $request->body,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return Playlist::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * Returns the user's playlists
     *
     * @param int $serviceParam
     * @param GetPlaylistsRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return array<Playlist>
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getPlaylists(int $serviceParam, GetPlaylistsRequest $request, ?array $options = null): array
    {
        $query = [];
        $query['otherField'] = $request->otherField;
        $query['multiLineDocs'] = $request->multiLineDocs;
        $query['multipleField'] = $request->multipleField;
        if ($request->limit != null) {
            $query['limit'] = $request->limit;
        }
        if ($request->optionalMultipleField != null) {
            $query['optionalMultipleField'] = $request->optionalMultipleField;
        }
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/v2/playlist/$serviceParam/all",
                    method: HttpMethod::GET,
                    query: $query,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return JsonDecoder::decodeArray($json, [Playlist::class]); // @phpstan-ignore-line
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * Returns a playlist
     *
     * @param int $serviceParam
     * @param string $playlistId
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return Playlist
     * @throws SeedException
     * @throws SeedApiException
     */
    public function getPlaylist(int $serviceParam, string $playlistId, ?array $options = null): Playlist
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/v2/playlist/$serviceParam/$playlistId",
                    method: HttpMethod::GET,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                return Playlist::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * Updates a playlist
     *
     * @param int $serviceParam
     * @param string $playlistId
     * @param ?UpdatePlaylistRequest $request
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @return ?Playlist
     * @throws SeedException
     * @throws SeedApiException
     */
    public function updatePlaylist(int $serviceParam, string $playlistId, ?UpdatePlaylistRequest $request = null, ?array $options = null): ?Playlist
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/v2/playlist/$serviceParam/$playlistId",
                    method: HttpMethod::PUT,
                    body: $request,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                $json = $response->getBody()->getContents();
                if (empty($json)) {
                    return null;
                }
                return Playlist::fromJson($json);
            }
        } catch (JsonException $e) {
            throw new SeedException("Failed to deserialize response: {$e->getMessage()}");
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }

    /**
     * Deletes a playlist
     *
     * @param int $serviceParam
     * @param string $playlistId
     * @param ?array{
     *   baseUrl?: string,
     * } $options
     * @throws SeedException
     * @throws SeedApiException
     */
    public function deletePlaylist(int $serviceParam, string $playlistId, ?array $options = null): void
    {
        try {
            $response = $this->client->sendRequest(
                new JsonApiRequest(
                    baseUrl: $this->options['baseUrl'] ?? $this->client->options['baseUrl'] ?? Environments::Prod->value,
                    path: "/v2/playlist/$serviceParam/$playlistId",
                    method: HttpMethod::DELETE,
                ),
            );
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new SeedException($e->getMessage());
        }
        throw new SeedApiException("API request failed", $statusCode, $response->getBody()->getContents());
    }
}
