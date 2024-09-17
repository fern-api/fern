<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Users\UserListContainer;

class UserPage extends SerializableType
{
    #[JsonProperty("data")]
    /**
     * @var UserListContainer $data
     */
    public UserListContainer $data;

    #[JsonProperty("next")]
    /**
     * @var ?string $next
     */
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
