<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Users\UserOptionalListContainer;

class UserOptionalListPage extends SerializableType
{
    #[JsonProperty("data")]
    /**
     * @var UserOptionalListContainer $data
     */
    public UserOptionalListContainer $data;

    #[JsonProperty("next")]
    /**
     * @var ?string $next
     */
    public ?string $next;

    /**
     * @param UserOptionalListContainer $data
     * @param ?string $next
     */
    public function __construct(
        UserOptionalListContainer $data,
        ?string $next = null,
    ) {
        $this->data = $data;
        $this->next = $next;
    }
}
