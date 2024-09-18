<?php

namespace Seed\Playlist\Requests;

use DateTime;
use Seed\Playlist\Types\PlaylistCreateRequest;

class CreatePlaylistRequest
{
    /**
     * @var DateTime $datetime
     */
    public DateTime $datetime;

    /**
     * @var PlaylistCreateRequest $body
     */
    public PlaylistCreateRequest $body;

    /**
     * @var ?DateTime $optionalDatetime
     */
    public ?DateTime $optionalDatetime;

    /**
     * @param DateTime $datetime
     * @param PlaylistCreateRequest $body
     * @param ?DateTime $optionalDatetime
     */
    public function __construct(
        DateTime $datetime,
        PlaylistCreateRequest $body,
        ?DateTime $optionalDatetime = null,
    ) {
        $this->datetime = $datetime;
        $this->body = $body;
        $this->optionalDatetime = $optionalDatetime;
    }
}
