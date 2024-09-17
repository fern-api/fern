<?php

namespace Seed\Playlist\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class Playlist extends SerializableType
{
    #[JsonProperty("playlist_id")]
    /**
     * @var string $playlistId
     */
    public string $playlistId;

    #[JsonProperty("owner-id")]
    /**
     * @var string $ownerId
     */
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
