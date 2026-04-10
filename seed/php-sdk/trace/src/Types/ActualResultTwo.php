<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class ActualResultTwo extends JsonSerializableType
{
    /**
     * @var value-of<ActualResultTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null $value
     */
    #[JsonProperty('value'), Union(ExceptionV2Zero::class, ExceptionV2Type::class, 'null')]
    public ExceptionV2Zero|ExceptionV2Type|null $value;

    /**
     * @param array{
     *   type: value-of<ActualResultTwoType>,
     *   value?: (
     *    ExceptionV2Zero
     *   |ExceptionV2Type
     * )|null,
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
