<?php

namespace Seed\Users\Requests;

use Seed\Users\Types\WithCursor;
use Seed\Core\JsonProperty;

class ListUsersBodyCursorPaginationRequest
{
    /**
     * @var ?WithCursor $pagination The object that contains the cursor used for pagination
    in order to fetch the next page of results.

     */
    #[JsonProperty("pagination")]
    public ?WithCursor $pagination;

    /**
     * @param ?WithCursor $pagination The object that contains the cursor used for pagination
    in order to fetch the next page of results.

     */
    public function __construct(
        ?WithCursor $pagination = null,
    ) {
        $this->pagination = $pagination;
    }
}
