<?php

namespace Seed\Playlist\Requests;

use Seed\Core\Json\SerializableType;
use DateTime;
use Seed\Playlist\Types\PlaylistCreateRequest;

class CreatePlaylistRequest extends SerializableType
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
     *   optionalDatetime?: ?DateTime,
     *   body: PlaylistCreateRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->datetime = $values['datetime'];
        $this->optionalDatetime = $values['optionalDatetime'] ?? null;
        $this->body = $values['body'];
    }
}
