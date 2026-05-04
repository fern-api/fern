<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UserSearchResponse extends JsonSerializableType
{
    /**
     * @var ?array<User> $results Current page of results from the requested resource.
     */
    #[JsonProperty('results'), ArrayType([User::class])]
    public ?array $results;

    /**
     * @var PagingCursors $paging
     */
    #[JsonProperty('paging')]
    public PagingCursors $paging;

    /**
     * @param array{
     *   paging: PagingCursors,
     *   results?: ?array<User>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->results = $values['results'] ?? null;
        $this->paging = $values['paging'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
