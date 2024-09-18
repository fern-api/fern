<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UserPage extends SerializableType
{
    /**
     * @var UserListContainer $data
     */
    #[JsonProperty("data")]
    public UserListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty("next")]
    public ?string $next;

    /**
     * @param UserListContainer $data
     * @param ?string $next
     */
    public function __construct(
        UserListContainer $data,
        ?string $next = null,
    ) {
        $this->data = $data;
        $this->next = $next;
    }
}
