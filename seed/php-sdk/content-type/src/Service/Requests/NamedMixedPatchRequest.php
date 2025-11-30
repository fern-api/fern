<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NamedMixedPatchRequest extends JsonSerializableType
{
    /**
     * @var ?string $appId
     */
    #[JsonProperty('appId')]
    public ?string $appId;

    /**
     * @var ?string $instructions
     */
    #[JsonProperty('instructions')]
    public ?string $instructions;

    /**
     * @var ?bool $active
     */
    #[JsonProperty('active')]
    public ?bool $active;

    /**
     * @param array{
     *   appId?: ?string,
     *   instructions?: ?string,
     *   active?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->appId = $values['appId'] ?? null;$this->instructions = $values['instructions'] ?? null;$this->active = $values['active'] ?? null;
    }
}
