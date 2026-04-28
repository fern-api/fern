<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class CreateCatalogImageRequest extends JsonSerializableType
{
    /**
     * @var ?string $caption
     */
    #[JsonProperty('caption')]
    public ?string $caption;

    /**
     * @var string $catalogObjectId
     */
    #[JsonProperty('catalog_object_id')]
    public string $catalogObjectId;

    /**
     * @param array{
     *   catalogObjectId: string,
     *   caption?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->caption = $values['caption'] ?? null;
        $this->catalogObjectId = $values['catalogObjectId'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
