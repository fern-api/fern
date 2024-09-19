<?php

namespace Seed\Playlist\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Playlist extends SerializableType
{
    /**
     * @var string $playlistId
     */
    #[JsonProperty("playlist_id")]
    public string $playlistId;

    /**
     * @var string $ownerId
     */
    #[JsonProperty("owner-id")]
    public string $ownerId;

    /**
     * @param string $playlistId
     * @param string $ownerId
     */
    public function __construct(
        string $playlistId,
        string $ownerId,
    ) {
        $this->playlistId = $playlistId;
        $this->ownerId = $ownerId;
    }
}
