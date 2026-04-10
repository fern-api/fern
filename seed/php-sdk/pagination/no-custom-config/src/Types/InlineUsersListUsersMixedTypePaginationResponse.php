<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class InlineUsersListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    public string $next;

    /**
     * @var InlineUsersUsers $data
     */
    #[JsonProperty('data')]
    public InlineUsersUsers $data;

    /**
     * @param array{
     *   next: string,
     *   data: InlineUsersUsers,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->next = $values['next'];
        $this->data = $values['data'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
