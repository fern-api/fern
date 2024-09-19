<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class UserOptionalListPage extends SerializableType
{
    /**
     * @var UserOptionalListContainer $data
     */
    #[JsonProperty("data")]
    public UserOptionalListContainer $data;

    /**
     * @var ?string $next
     */
    #[JsonProperty("next")]
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
