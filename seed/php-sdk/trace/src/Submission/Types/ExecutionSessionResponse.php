<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;

class ExecutionSessionResponse extends SerializableType
{
    /**
     * @var string $sessionId
     */
    #[JsonProperty("sessionId")]
    public string $sessionId;

    /**
     * @var Language $language
     */
    #[JsonProperty("language")]
    public Language $language;

    /**
     * @var ExecutionSessionStatus $status
     */
    #[JsonProperty("status")]
    public ExecutionSessionStatus $status;

    /**
     * @var ?string $executionSessionUrl
     */
    #[JsonProperty("executionSessionUrl")]
    public ?string $executionSessionUrl;

    /**
     * @param string $sessionId
     * @param Language $language
     * @param ExecutionSessionStatus $status
     * @param ?string $executionSessionUrl
     */
    public function __construct(
        string $sessionId,
        Language $language,
        ExecutionSessionStatus $status,
        ?string $executionSessionUrl = null,
    ) {
        $this->sessionId = $sessionId;
        $this->language = $language;
        $this->status = $status;
        $this->executionSessionUrl = $executionSessionUrl;
    }
}
