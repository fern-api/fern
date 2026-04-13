<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BadRequestErrorBody extends JsonSerializableType
{
    /**
     * @var ?value-of<BadRequestErrorBodyErrorName> $errorName
     */
    #[JsonProperty('errorName')]
    public ?string $errorName;

    /**
     * @var ?PropertyBasedErrorTestBody $content
     */
    #[JsonProperty('content')]
    public ?PropertyBasedErrorTestBody $content;

    /**
     * @param array{
     *   errorName?: ?value-of<BadRequestErrorBodyErrorName>,
     *   content?: ?PropertyBasedErrorTestBody,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->errorName = $values['errorName'] ?? null;
        $this->content = $values['content'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
