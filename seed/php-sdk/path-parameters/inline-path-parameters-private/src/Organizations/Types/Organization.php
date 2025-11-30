<?php

namespace Seed\Organizations\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Organization extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    private string $name;

    /**
     * @var array<string> $tags
     */
    #[JsonProperty('tags'), ArrayType(['string'])]
    private array $tags;

    /**
     * @param array{
     *   name: string,
     *   tags: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->tags = $values['tags'];
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
     * @return array<string>
     */
    public function getTags(): array {
        return $this->tags;}

    /**
     * @param array<string> $value
     */
    public function setTags(array $value): self {
        $this->tags = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
