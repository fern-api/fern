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
     * @var ?DateTime $optionalDatetime
     */
    public ?DateTime $optionalDatetime;

    /**
     * @var PlaylistCreateRequest $body
     */
    public PlaylistCreateRequest $body;

}
