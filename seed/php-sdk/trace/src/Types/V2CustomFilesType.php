<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2CustomFilesType extends JsonSerializableType
{
    /**
     * @var value-of<V2CustomFilesTypeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var ?array<string, V2Files> $value
     */
    #[JsonProperty('value'), ArrayType(['string' => V2Files::class])]
    public ?array $value;

    /**
     * @param array{
     *   type: value-of<V2CustomFilesTypeType>,
     *   value?: ?array<string, V2Files>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
