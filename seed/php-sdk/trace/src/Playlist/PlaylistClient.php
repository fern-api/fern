<?php

namespace Seed\Playlist;

use Seed\Core\RawClient;
use Seed\Playlist\Requests\CreatePlaylistRequest;
use Seed\Core\Constant;
use JsonException;
use Exception;
use Psr\Http\Client\ClientExceptionInterface;
use Seed\Playlist\Requests\GetPlaylistsRequest;
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
     * @param int serviceParam
     * @param CreatePlaylistRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function createPlaylist(int $serviceParam, CreatePlaylistRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['datetime'] = request->datetime->format(Constant::DateTimeFormat);
        if (request->optionalDatetime != null) {
            $query['optionalDatetime'] = request->optionalDatetime;
        }
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
    * Returns the user's playlists
     * @param int serviceParam
     * @param GetPlaylistsRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getPlaylists(int $serviceParam, GetPlaylistsRequest $request, ?array $options = null): mixed
    {
        $query = [];
        $query['otherField'] = request->otherField;
        $query['multiLineDocs'] = request->multiLineDocs;
        $query['multipleField'] = request->multipleField;
        if (request->limit != null) {
            $query['limit'] = request->limit;
        }
        if (request->optionalMultipleField != null) {
            $query['optionalMultipleField'] = request->optionalMultipleField;
        }
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
    * Returns a playlist
     * @param int serviceParam
     * @param string playlistId
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function getPlaylist(int $serviceParam, string $playlistId, ?array $options = null): mixed
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
    * Updates a playlist
     * @param int serviceParam
     * @param string playlistId
     * @param ?UpdatePlaylistRequest request
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function updatePlaylist(int $serviceParam, string $playlistId, ?UpdatePlaylistRequest $request = null, ?array $options = null): mixed
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
    * Deletes a playlist
     * @param int serviceParam
     * @param string playlistId
     * @param ?array{baseUrl?: string} $options
     * @returns mixed
     */
    public function deletePlaylist(int $serviceParam, string $playlistId, ?array $options = null): mixed
    {
        try {
            $response = $this->client->sendRequest();
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 400) {
                return;
            }
        } catch (ClientExceptionInterface $e) {
            throw new Exception($e->getMessage());
        }
        throw new Exception("Error with status code " . $statusCode);
    }

}
