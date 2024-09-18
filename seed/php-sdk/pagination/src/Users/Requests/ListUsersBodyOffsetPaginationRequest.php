<?php

namespace Seed\Users\Requests;

use Seed\Users\Types\WithPage;
use Seed\Core\JsonProperty;

class ListUsersBodyOffsetPaginationRequest
{
    /**
     * @var ?WithPage $pagination The object that contains the offset used for pagination
    in order to fetch the next page of results.

     */
    #[JsonProperty("pagination")]
    public ?WithPage $pagination;

    /**
     * @param ?WithPage $pagination The object that contains the offset used for pagination
    in order to fetch the next page of results.

     */
    public function __construct(
        ?WithPage $pagination = null,
    ) {
        $this->pagination = $pagination;
    }
}
