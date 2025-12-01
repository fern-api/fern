<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class User extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @var int $id
     */
    #[JsonProperty('id')]
    private int $id;

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
    public function getName(): string {
        return $this->name;}

    /**
     * @param string $value
     */
    public function setName(string $value): self {
        $this->name = $value;return $this;}

    /**
     * @return int
     */
    public function getId(): int {
        return $this->id;}

    /**
     * @param int $value
     */
    public function setId(int $value): self {
        $this->id = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
