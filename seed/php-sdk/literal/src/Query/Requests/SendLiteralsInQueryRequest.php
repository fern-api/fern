<?php

namespace Seed\Query\Requests;

use Seed\Core\Json\JsonSerializableType;

class SendLiteralsInQueryRequest extends JsonSerializableType
{
    /**
     * @var 'You are a helpful assistant' $prompt
     */
    public string $prompt;

    /**
     * @var ?'You are a helpful assistant' $optionalPrompt
     */
    public ?string $optionalPrompt;

    /**
     * @var 'You are a helpful assistant' $aliasPrompt
     */
    public string $aliasPrompt;

    /**
     * @var ?'You are a helpful assistant' $aliasOptionalPrompt
     */
    public ?string $aliasOptionalPrompt;

    /**
     * @var string $query
     */
    public string $query;

    /**
     * @var false $stream
     */
    public bool $stream;

    /**
     * @var ?false $optionalStream
     */
    public ?bool $optionalStream;

    /**
     * @var false $aliasStream
     */
    public bool $aliasStream;

    /**
     * @var ?false $aliasOptionalStream
     */
    public ?bool $aliasOptionalStream;

    /**
     * @param array{
     *   prompt: 'You are a helpful assistant',
     *   aliasPrompt: 'You are a helpful assistant',
     *   query: string,
     *   stream: false,
     *   aliasStream: false,
     *   optionalPrompt?: ?'You are a helpful assistant',
     *   aliasOptionalPrompt?: ?'You are a helpful assistant',
     *   optionalStream?: ?false,
     *   aliasOptionalStream?: ?false,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->prompt = $values['prompt'];$this->optionalPrompt = $values['optionalPrompt'] ?? null;$this->aliasPrompt = $values['aliasPrompt'];$this->aliasOptionalPrompt = $values['aliasOptionalPrompt'] ?? null;$this->query = $values['query'];$this->stream = $values['stream'];$this->optionalStream = $values['optionalStream'] ?? null;$this->aliasStream = $values['aliasStream'];$this->aliasOptionalStream = $values['aliasOptionalStream'] ?? null;
    }
}
