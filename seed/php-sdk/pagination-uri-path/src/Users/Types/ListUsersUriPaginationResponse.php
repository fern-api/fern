<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersUriPaginationResponse extends JsonSerializableType
{
    /**
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    public array $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty('next')]
    public ?string $next;

    /**
     * @param array{
     *   data: array<User>,
     *   next?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->data = $values['data'];
        $this->next = $values['next'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
