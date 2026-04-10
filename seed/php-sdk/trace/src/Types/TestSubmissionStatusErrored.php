<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class TestSubmissionStatusErrored extends JsonSerializableType
{
    /**
     * @var (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * )|null $value
     */
    #[JsonProperty('value'), Union(ErrorInfoZero::class, ErrorInfoOne::class, ErrorInfoTwo::class, 'null')]
    public ErrorInfoZero|ErrorInfoOne|ErrorInfoTwo|null $value;

    /**
     * @param array{
     *   value?: (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * )|null,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
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
