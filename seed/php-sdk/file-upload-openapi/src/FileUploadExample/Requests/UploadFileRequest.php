<?php

namespace Seed\FileUploadExample\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Utils\File;

class UploadFileRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?File $file
     */
    public ?File $file;

    /**
     * @param array{
     *   name: string,
     *   file?: ?File,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->name = $values['name'];$this->file = $values['file'] ?? null;
    }
}
