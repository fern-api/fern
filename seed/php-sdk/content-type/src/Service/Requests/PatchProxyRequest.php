<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PatchProxyRequest extends JsonSerializableType
{
    /**
     * @var ?string $application
     */
    #[JsonProperty('application')]
    public ?string $application;

    /**
     * @var ?bool $requireAuth
     */
    #[JsonProperty('require_auth')]
    public ?bool $requireAuth;

    /**
     * @param array{
     *   application?: ?string,
     *   requireAuth?: ?bool,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->application = $values['application'] ?? null;$this->requireAuth = $values['requireAuth'] ?? null;
    }
}
