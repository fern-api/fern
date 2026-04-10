<?php

namespace Seed\Query\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Query\Types\QuerySendRequestPrompt;
use Seed\Query\Types\QuerySendRequestOptionalPrompt;
use Seed\Types\AliasToPrompt;

class QuerySendRequest extends JsonSerializableType
{
    /**
     * @var value-of<QuerySendRequestPrompt> $prompt
     */
    public string $prompt;

    /**
     * @var ?value-of<QuerySendRequestOptionalPrompt> $optionalPrompt
     */
    public ?string $optionalPrompt;

    /**
     * @var value-of<AliasToPrompt> $aliasPrompt
     */
    public string $aliasPrompt;

    /**
     * @var ?value-of<AliasToPrompt> $aliasOptionalPrompt
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
     *   prompt: value-of<QuerySendRequestPrompt>,
     *   aliasPrompt: value-of<AliasToPrompt>,
     *   query: string,
     *   stream: bool,
     *   aliasStream: bool,
     *   optionalPrompt?: ?value-of<QuerySendRequestOptionalPrompt>,
     *   aliasOptionalPrompt?: ?value-of<AliasToPrompt>,
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
