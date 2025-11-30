<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Foo extends JsonSerializableType
{
    /**
     * @var ?string $bar
     */
    #[JsonProperty('bar')]
    public ?string $bar;

    /**
     * @var ?string $nullableBar
     */
    #[JsonProperty('nullable_bar')]
    public ?string $nullableBar;

    /**
     * @var ?string $nullableRequiredBar
     */
    #[JsonProperty('nullable_required_bar')]
    public ?string $nullableRequiredBar;

    /**
     * @var string $requiredBar
     */
    #[JsonProperty('required_bar')]
    public string $requiredBar;

    /**
     * @param array{
     *   requiredBar: string,
     *   bar?: ?string,
     *   nullableBar?: ?string,
     *   nullableRequiredBar?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->bar = $values['bar'] ?? null;$this->nullableBar = $values['nullableBar'] ?? null;$this->nullableRequiredBar = $values['nullableRequiredBar'] ?? null;$this->requiredBar = $values['requiredBar'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
