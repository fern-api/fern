<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ItemNotFound extends JsonSerializableType
{
    /**
     * @var string $itemId
     */
    #[JsonProperty('item_id')]
    public string $itemId;

    /**
     * @param array{
     *   itemId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->itemId = $values['itemId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
