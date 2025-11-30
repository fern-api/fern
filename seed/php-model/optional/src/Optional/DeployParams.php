<?php

namespace Seed\Optional;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class DeployParams extends JsonSerializableType
{
    /**
     * @var ?bool $updateDraft
     */
    #[JsonProperty('updateDraft')]
    public ?bool $updateDraft;

    /**
     * @param array{
     *   updateDraft?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->updateDraft = $values['updateDraft'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
