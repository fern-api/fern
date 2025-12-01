<?php

namespace Seed\InlineUsers\InlineUsers;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class User extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var int $id
     */
    #[JsonProperty('id')]
    public int $id;

    /**
     * @param array{
     *   name: string,
     *   id: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->id = $values['id'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
