<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UserSearchResponse extends JsonSerializableType
{
    /**
     * @var PagingCursors $paging
     */
    #[JsonProperty('paging')]
    public PagingCursors $paging;

    /**
     * @var ?array<User> $results Current page of results from the requested resource.
     */
    #[JsonProperty('results'), ArrayType([User::class])]
    public ?array $results;

    /**
     * @param array{
     *   paging: PagingCursors,
     *   results?: ?array<User>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->paging = $values['paging'];
        $this->results = $values['results'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
