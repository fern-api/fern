<?php

namespace Seed\InlineUsers\InlineUsers\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListUsersExtendedRequest extends JsonSerializableType
{
    /**
     * @var ?string $cursor
     */
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
}
