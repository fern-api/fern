<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class WithCursor extends JsonSerializableType
{
    /**
     * @var ?string $cursor
     */
    #[JsonProperty('cursor')]
    private ?string $cursor;

    /**
     * @param array{
     *   cursor?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->cursor = $values['cursor'] ?? null;
    }

    /**
     * @return ?string
     */
    public function getCursor(): ?string {
        return $this->cursor;}

    /**
     * @param ?string $value
     */
    public function setCursor(?string $value = null): self {
        $this->cursor = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
