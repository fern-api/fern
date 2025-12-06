<?php

namespace Seed\Union\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GetShapeRequest extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    private string $id;

    /**
     * @param array{
     *   id: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];
    }

    /**
     * @return string
     */
    public function getId(): string {
        return $this->id;}

    /**
     * @param string $value
     */
    public function setId(string $value): self {
        $this->id = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
