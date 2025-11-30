<?php

namespace Seed\Playlist;

use Seed\Core\Json\JsonSerializableType;
use Seed\Playlist\Traits\PlaylistCreateRequest;
use Seed\Core\Json\JsonProperty;

class Playlist extends JsonSerializableType
{
    use PlaylistCreateRequest;

    /**
     * @var string $playlistId
     */
    #[JsonProperty('playlist_id')]
    public string $playlistId;

    /**
     * @var string $ownerId
     */
    #[JsonProperty('owner-id')]
    public string $ownerId;

    /**
     * @param array{
     *   name: string,
     *   problems: array<string>,
     *   playlistId: string,
     *   ownerId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->problems = $values['problems'];$this->playlistId = $values['playlistId'];$this->ownerId = $values['ownerId'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
