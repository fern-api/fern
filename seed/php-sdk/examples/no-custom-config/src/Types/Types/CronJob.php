<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CronJob extends JsonSerializableType
{
    /**
     * @var string $expression
     */
    #[JsonProperty('expression')]
    public string $expression;

    /**
     * @param array{
     *   expression: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->expression = $values['expression'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
