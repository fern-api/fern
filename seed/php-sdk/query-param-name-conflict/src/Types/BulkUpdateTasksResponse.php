<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BulkUpdateTasksResponse extends JsonSerializableType
{
    /**
     * @var ?int $updatedCount
     */
    #[JsonProperty('updated_count')]
    public ?int $updatedCount;

    /**
     * @param array{
     *   updatedCount?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->updatedCount = $values['updatedCount'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
