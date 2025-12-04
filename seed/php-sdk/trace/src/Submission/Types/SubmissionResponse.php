<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class SubmissionResponse extends JsonSerializableType
{
    /**
     * @var (
     *    'serverInitialized'
     *   |'problemInitialized'
     *   |'workspaceInitialized'
     *   |'serverErrored'
     *   |'codeExecutionUpdate'
     *   |'terminated'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    null
     *   |string
     *   |ExceptionInfo
     *   |CodeExecutionUpdate
     *   |TerminatedResponse
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'serverInitialized'
     *   |'problemInitialized'
     *   |'workspaceInitialized'
     *   |'serverErrored'
     *   |'codeExecutionUpdate'
     *   |'terminated'
     *   |'_unknown'
     * ),
     *   value: (
     *    null
     *   |string
     *   |ExceptionInfo
     *   |CodeExecutionUpdate
     *   |TerminatedResponse
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @return SubmissionResponse
     */
    public static function serverInitialized(): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'serverInitialized',
            'value' => null,
        ]);
    }

    /**
     * @param string $problemInitialized
     * @return SubmissionResponse
     */
    public static function problemInitialized(string $problemInitialized): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'problemInitialized',
            'value' => $problemInitialized,
        ]);
    }

    /**
     * @return SubmissionResponse
     */
    public static function workspaceInitialized(): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'workspaceInitialized',
            'value' => null,
        ]);
    }

    /**
     * @param ExceptionInfo $serverErrored
     * @return SubmissionResponse
     */
    public static function serverErrored(ExceptionInfo $serverErrored): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'serverErrored',
            'value' => $serverErrored,
        ]);
    }

    /**
     * @param CodeExecutionUpdate $codeExecutionUpdate
     * @return SubmissionResponse
     */
    public static function codeExecutionUpdate(CodeExecutionUpdate $codeExecutionUpdate): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'codeExecutionUpdate',
            'value' => $codeExecutionUpdate,
        ]);
    }

    /**
     * @param TerminatedResponse $terminated
     * @return SubmissionResponse
     */
    public static function terminated(TerminatedResponse $terminated): SubmissionResponse {
        return new SubmissionResponse([
            'type' => 'terminated',
            'value' => $terminated,
        ]);
    }

    /**
     * @return bool
     */
    public function isServerInitialized(): bool {
        return is_null($this->value)&& $this->type === 'serverInitialized';
    }

    /**
     * @return bool
     */
    public function isProblemInitialized(): bool {
        return is_string($this->value)&& $this->type === 'problemInitialized';
    }

    /**
     * @return string
     */
    public function asProblemInitialized(): string {
        if (!(is_string($this->value)&& $this->type === 'problemInitialized')){
            throw new Exception(
                "Expected problemInitialized; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isWorkspaceInitialized(): bool {
        return is_null($this->value)&& $this->type === 'workspaceInitialized';
    }

    /**
     * @return bool
     */
    public function isServerErrored(): bool {
        return $this->value instanceof ExceptionInfo&& $this->type === 'serverErrored';
    }

    /**
     * @return ExceptionInfo
     */
    public function asServerErrored(): ExceptionInfo {
        if (!($this->value instanceof ExceptionInfo&& $this->type === 'serverErrored')){
            throw new Exception(
                "Expected serverErrored; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isCodeExecutionUpdate(): bool {
        return $this->value instanceof CodeExecutionUpdate&& $this->type === 'codeExecutionUpdate';
    }

    /**
     * @return CodeExecutionUpdate
     */
    public function asCodeExecutionUpdate(): CodeExecutionUpdate {
        if (!($this->value instanceof CodeExecutionUpdate&& $this->type === 'codeExecutionUpdate')){
            throw new Exception(
                "Expected codeExecutionUpdate; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTerminated(): bool {
        return $this->value instanceof TerminatedResponse&& $this->type === 'terminated';
    }

    /**
     * @return TerminatedResponse
     */
    public function asTerminated(): TerminatedResponse {
        if (!($this->value instanceof TerminatedResponse&& $this->type === 'terminated')){
            throw new Exception(
                "Expected terminated; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'serverInitialized':
                $result['serverInitialized'] = [];
                break;
            case 'problemInitialized':
                $value = $this->value;
                $result['problemInitialized'] = $value;
                break;
            case 'workspaceInitialized':
                $result['workspaceInitialized'] = [];
                break;
            case 'serverErrored':
                $value = $this->asServerErrored()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'codeExecutionUpdate':
                $value = $this->asCodeExecutionUpdate()->jsonSerialize();
                $result['codeExecutionUpdate'] = $value;
                break;
            case 'terminated':
                $value = $this->asTerminated()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'serverInitialized':
                $args['value'] = null;
                break;
            case 'problemInitialized':
                if (!array_key_exists('problemInitialized', $data)){
                    throw new Exception(
                        "JSON data is missing property 'problemInitialized'",
                    );
                }
                
                $args['value'] = $data['problemInitialized'];
                break;
            case 'workspaceInitialized':
                $args['value'] = null;
                break;
            case 'serverErrored':
                $args['value'] = ExceptionInfo::jsonDeserialize($data);
                break;
            case 'codeExecutionUpdate':
                if (!array_key_exists('codeExecutionUpdate', $data)){
                    throw new Exception(
                        "JSON data is missing property 'codeExecutionUpdate'",
                    );
                }
                
                if (!(is_array($data['codeExecutionUpdate']))){
                    throw new Exception(
                        "Expected property 'codeExecutionUpdate' in JSON data to be array, instead received " . get_debug_type($data['codeExecutionUpdate']),
                    );
                }
                $args['value'] = CodeExecutionUpdate::jsonDeserialize($data['codeExecutionUpdate']);
                break;
            case 'terminated':
                $args['value'] = TerminatedResponse::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
