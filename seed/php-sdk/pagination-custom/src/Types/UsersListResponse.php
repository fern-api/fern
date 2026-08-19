<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UsersListResponse extends JsonSerializableType
{
    /**
     * @var ?int $limit
     */
    #[JsonProperty('limit')]
    public ?int $limit;

    /**
     * @var ?int $count
     */
    #[JsonProperty('count')]
    public ?int $count;

    /**
     * @var ?bool $hasMore
     */
    #[JsonProperty('has_more')]
    public ?bool $hasMore;

    /**
     * @var array<Link> $links
     */
    #[JsonProperty('links'), ArrayType([Link::class])]
    public array $links;

    /**
     * @var array<string> $data
     */
    #[JsonProperty('data'), ArrayType(['string'])]
    public array $data;

    /**
     * @param array{
     *   links: array<Link>,
     *   data: array<string>,
     *   limit?: ?int,
     *   count?: ?int,
     *   hasMore?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->limit = $values['limit'] ?? null;
        $this->count = $values['count'] ?? null;
        $this->hasMore = $values['hasMore'] ?? null;
        $this->links = $values['links'];
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
