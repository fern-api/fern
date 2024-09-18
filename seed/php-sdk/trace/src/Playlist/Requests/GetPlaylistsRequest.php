<?php

namespace Seed\Playlist\Requests;

class GetPlaylistsRequest
{
    /**
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @var string $otherField i'm another field
     */
    public string $otherField;

    /**
     * @var string $multiLineDocs I'm a multiline
    description
     */
    public string $multiLineDocs;

    /**
     * @var array<?string> $optionalMultipleField
     */
    public array $optionalMultipleField;

    /**
     * @var array<string> $multipleField
     */
    public array $multipleField;

}
