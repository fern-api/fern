<?php

namespace Seed\FolderAService\Requests;

use Seed\Core\Json\JsonSerializableType;

class FolderAServiceGetDirectThreadRequest extends JsonSerializableType
{
    /**
     * @var ?array<string> $ids
     */
    public ?array $ids;

    /**
     * @var ?array<string> $tags
     */
    public ?array $tags;

    /**
     * @param array{
     *   ids?: ?array<string>,
     *   tags?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->ids = $values['ids'] ?? null;
        $this->tags = $values['tags'] ?? null;
    }
}
