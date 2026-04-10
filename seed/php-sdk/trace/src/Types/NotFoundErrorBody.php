<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NotFoundErrorBody extends JsonSerializableType
{
    /**
     * @var ?value-of<NotFoundErrorBodyErrorName> $errorName
     */
    #[JsonProperty('errorName')]
    public ?string $errorName;

    /**
     * @var ?PlaylistIdNotFoundErrorBody $content
     */
    #[JsonProperty('content')]
    public ?PlaylistIdNotFoundErrorBody $content;

    /**
     * @param array{
     *   errorName?: ?value-of<NotFoundErrorBodyErrorName>,
     *   content?: ?PlaylistIdNotFoundErrorBody,
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
