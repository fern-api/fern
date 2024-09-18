<?php

namespace Seed\Playlist\Requests;

class GetPlaylistsRequest
{
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

    /**
     * @var ?int $limit
     */
    public ?int $limit;

    /**
     * @param string $otherField i'm another field
     * @param string $multiLineDocs I'm a multiline
    description
     * @param array<?string> $optionalMultipleField
     * @param array<string> $multipleField
     * @param ?int $limit
     */
    public function __construct(
        string $otherField,
        string $multiLineDocs,
        array $optionalMultipleField,
        array $multipleField,
        ?int $limit = null,
    ) {
        $this->otherField = $otherField;
        $this->multiLineDocs = $multiLineDocs;
        $this->optionalMultipleField = $optionalMultipleField;
        $this->multipleField = $multipleField;
        $this->limit = $limit;
    }
}
