<?php

namespace Seed\Completions\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GroupDeletedEvent extends JsonSerializableType
{
    /**
     * @var string $offset
     */
    #[JsonProperty('offset')]
    public string $offset;

    /**
     * @var string $groupId
     */
    #[JsonProperty('group_id')]
    public string $groupId;

    /**
     * @param array{
     *   offset: string,
     *   groupId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->offset = $values['offset'];
        $this->groupId = $values['groupId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
