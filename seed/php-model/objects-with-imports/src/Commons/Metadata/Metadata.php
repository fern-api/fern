<?php

namespace Seed\Commons\Metadata;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class Metadata extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var ?array<string, string> $data
     */
    #[JsonProperty('data'), ArrayType(['string' => 'string'])]
    public ?array $data;

    /**
     * @param array{
     *   id: string,
     *   data?: ?array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->data = $values['data'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
