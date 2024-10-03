<?php

namespace Seed\Playlist\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetPlaylistsRequest extends JsonSerializableType
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

    /**
     * @param array{
     *   limit?: ?int,
     *   otherField: string,
     *   multiLineDocs: string,
     *   optionalMultipleField: array<?string>,
     *   multipleField: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->limit = $values['limit'] ?? null;
        $this->otherField = $values['otherField'];
        $this->multiLineDocs = $values['multiLineDocs'];
        $this->optionalMultipleField = $values['optionalMultipleField'];
        $this->multipleField = $values['multipleField'];
    }
}
