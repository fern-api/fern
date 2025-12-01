<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UsernamePage extends JsonSerializableType
{
    /**
     * @var ?string $after
     */
    #[JsonProperty('after')]
    private ?string $after;

    /**
     * @var array<string> $data
     */
    #[JsonProperty('data'), ArrayType(['string'])]
    private array $data;

    /**
     * @param array{
     *   data: array<string>,
     *   after?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->after = $values['after'] ?? null;$this->data = $values['data'];
    }

    /**
     * @return ?string
     */
    public function getAfter(): ?string {
        return $this->after;}

    /**
     * @param ?string $value
     */
    public function setAfter(?string $value = null): self {
        $this->after = $value;return $this;}

    /**
     * @return array<string>
     */
    public function getData(): array {
        return $this->data;}

    /**
     * @param array<string> $value
     */
    public function setData(array $value): self {
        $this->data = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
