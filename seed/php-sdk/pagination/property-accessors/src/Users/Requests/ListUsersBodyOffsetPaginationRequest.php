<?php

namespace Seed\Users\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Users\Types\WithPage;
use Seed\Core\Json\JsonProperty;

class ListUsersBodyOffsetPaginationRequest extends JsonSerializableType
{
    /**
     * The object that contains the offset used for pagination
     * in order to fetch the next page of results.
     *
     * @var ?WithPage $pagination
     */
    #[JsonProperty('pagination')]
    private ?WithPage $pagination;

    /**
     * @param array{
     *   pagination?: ?WithPage,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->pagination = $values['pagination'] ?? null;
    }

    /**
     * @return ?WithPage
     */
    public function getPagination(): ?WithPage {
        return $this->pagination;}

    /**
     * @param ?WithPage $value
     */
    public function setPagination(?WithPage $value = null): self {
        $this->pagination = $value;return $this;}
}
