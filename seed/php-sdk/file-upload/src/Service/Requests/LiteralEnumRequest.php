<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Core\Json\JsonProperty;
use Seed\Service\Types\OpenEnumType;

class LiteralEnumRequest extends JsonSerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var ?'model_v1' $modelType
     */
    #[JsonProperty('model_type')]
    public ?string $modelType;

    /**
     * @var ?value-of<OpenEnumType> $openEnum
     */
    #[JsonProperty('open_enum')]
    public ?string $openEnum;

    /**
     * @var ?string $maybeName
     */
    #[JsonProperty('maybe_name')]
    public ?string $maybeName;

    /**
     * @param array{
     *   file: File,
     *   modelType?: ?'model_v1',
     *   openEnum?: ?value-of<OpenEnumType>,
     *   maybeName?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->modelType = $values['modelType'] ?? null;
        $this->openEnum = $values['openEnum'] ?? null;
        $this->maybeName = $values['maybeName'] ?? null;
    }
}
