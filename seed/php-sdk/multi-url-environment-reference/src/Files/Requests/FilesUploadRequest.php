<?php

namespace Seed\Files\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class FilesUploadRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var string $parentId
     */
    #[JsonProperty('parent_id')]
    public string $parentId;

    /**
     * @param array{
     *   name: string,
     *   parentId: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->parentId = $values['parentId'];
    }
}
