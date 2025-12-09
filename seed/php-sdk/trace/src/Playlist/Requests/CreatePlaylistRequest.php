<?php

namespace Seed\Playlist\Requests;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Playlist\Types\PlaylistCreateRequest;

class CreatePlaylistRequest extends JsonSerializableType
{
    /**
     * @var DateTime $datetime
     */
    public DateTime $datetime;

    /**
     * @var ?DateTime $optionalDatetime
     */
    public ?DateTime $optionalDatetime;

    /**
     * @var PlaylistCreateRequest $body
     */
    public PlaylistCreateRequest $body;

    /**
     * @param array{
     *   datetime: DateTime,
     *   body: PlaylistCreateRequest,
     *   optionalDatetime?: ?DateTime,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->datetime = $values['datetime'];$this->optionalDatetime = $values['optionalDatetime'] ?? null;$this->body = $values['body'];
    }
}
