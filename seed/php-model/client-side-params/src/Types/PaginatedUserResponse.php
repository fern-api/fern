<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * Response with pagination info like Auth0
 */
class PaginatedUserResponse extends JsonSerializableType
{
    /**
     * @var array<User> $users
     */
    #[JsonProperty('users'), ArrayType([User::class])]
    public array $users;

    /**
     * @var int $start
     */
    #[JsonProperty('start')]
    public int $start;

    /**
     * @var int $limit
     */
    #[JsonProperty('limit')]
    public int $limit;

    /**
     * @var int $length
     */
    #[JsonProperty('length')]
    public int $length;

    /**
     * @var ?int $total
     */
    #[JsonProperty('total')]
    public ?int $total;

    /**
     * @param array{
     *   users: array<User>,
     *   start: int,
     *   limit: int,
     *   length: int,
     *   total?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->users = $values['users'];$this->start = $values['start'];$this->limit = $values['limit'];$this->length = $values['length'];$this->total = $values['total'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
