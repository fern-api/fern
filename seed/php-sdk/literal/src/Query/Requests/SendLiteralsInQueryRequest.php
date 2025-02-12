<?php

namespace Seed\Query\Requests;

use Seed\Core\Json\JsonSerializableType;

class SendLiteralsInQueryRequest extends JsonSerializableType
{
    /**
     * @var string $prompt
     */
    public string $prompt;

    /**
     * @var ?string $optionalPrompt
     */
    public ?string $optionalPrompt;

    /**
     * @var string $aliasPrompt
     */
    public string $aliasPrompt;

    /**
     * @var ?string $aliasOptionalPrompt
     */
    public ?string $aliasOptionalPrompt;

    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var bool $stream
     */
    public bool $stream;

    /**
     * @var ?bool $optionalStream
     */
    public ?bool $optionalStream;

    /**
     * @var bool $aliasStream
     */
    public bool $aliasStream;

    /**
     * @var ?bool $aliasOptionalStream
     */
    public ?bool $aliasOptionalStream;

    /**
     * @param array{
     *   prompt: string,
     *   aliasPrompt: string,
     *   query: string,
     *   stream: bool,
     *   aliasStream: bool,
     *   optionalPrompt?: ?string,
     *   aliasOptionalPrompt?: ?string,
     *   optionalStream?: ?bool,
     *   aliasOptionalStream?: ?bool,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->prompt = $values['prompt'];
        $this->optionalPrompt = $values['optionalPrompt'] ?? null;
        $this->aliasPrompt = $values['aliasPrompt'];
        $this->aliasOptionalPrompt = $values['aliasOptionalPrompt'] ?? null;
        $this->query = $values['query'];
        $this->stream = $values['stream'];
        $this->optionalStream = $values['optionalStream'] ?? null;
        $this->aliasStream = $values['aliasStream'];
        $this->aliasOptionalStream = $values['aliasOptionalStream'] ?? null;
    }
}
