<?php

namespace Seed\Users;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class ListUsersMixedTypePaginationResponse extends JsonSerializableType
{
    /**
     * @var string $next
     */
    #[JsonProperty('next')]
    public string $next;

    /**
     * @var array<User> $data
     */
    #[JsonProperty('data'), ArrayType([User::class])]
    public array $data;

    /**
     * @param array{
     *   next: string,
     *   data: array<User>,
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
