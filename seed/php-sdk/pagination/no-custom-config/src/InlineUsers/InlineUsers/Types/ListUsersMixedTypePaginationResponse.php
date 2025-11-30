<?php

namespace Seed\InlineUsers\InlineUsers\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    public string $next;

    /**
     * @var Users $data
     */
    #[JsonProperty('data')]
    public Users $data;

    /**
     * @param array{
     *   next: string,
     *   data: Users,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->next = $values['next'];$this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
