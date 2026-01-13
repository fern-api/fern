<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersTopLevelCursorPaginationResponse extends JsonSerializableType
{
    /**
     * @var ?string $nextCursor
     */
    #[JsonProperty('next_cursor')]
    private ?string $nextCursor;

    /**
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    private array $data;

    /**
     * @param array{
     *   data: array<User>,
     *   nextCursor?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->nextCursor = $values['nextCursor'] ?? null;
        $this->data = $values['data'];
    }

    /**
     * @return ?string
     */
    public function getNextCursor(): ?string
    {
        return $this->nextCursor;
    }

    /**
     * @param ?string $value
     */
    public function setNextCursor(?string $value = null): self
    {
        $this->nextCursor = $value;
        return $this;
    }

    /**
     * @return array<User>
     */
    public function getData(): array
    {
        return $this->data;
    }

    /**
     * @param array<User> $value
     */
    public function setData(array $value): self
    {
        $this->data = $value;
        return $this;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
