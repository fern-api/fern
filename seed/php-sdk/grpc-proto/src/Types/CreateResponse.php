<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateResponse extends JsonSerializableType
{
    /**
     * @var ?UserModel $user
     */
    #[JsonProperty('user')]
    public ?UserModel $user;

    /**
     * @param array{
     *   user?: ?UserModel,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->user = $values['user'] ?? null;
    }
}
