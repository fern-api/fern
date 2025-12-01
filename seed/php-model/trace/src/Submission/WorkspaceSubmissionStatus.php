<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class WorkspaceSubmissionStatus extends JsonSerializableType
{
    /**
     * @var (
     *    'stopped'
     *   |'errored'
     *   |'running'
     *   |'ran'
     *   |'traced'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    null
     *   |ErrorInfo
     *   |value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'stopped'
     *   |'errored'
     *   |'running'
     *   |'ran'
     *   |'traced'
     *   |'_unknown'
     * ),
     *   value: (
     *    null
     *   |ErrorInfo
     *   |value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
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
     * @return WorkspaceSubmissionStatus
     */
    public static function stopped(): WorkspaceSubmissionStatus {
        return new WorkspaceSubmissionStatus([
            'type' => 'stopped',
            'value' => null,
        ]);
    }

    /**
     * @param ErrorInfo $errored
     * @return WorkspaceSubmissionStatus
     */
    public static function errored(ErrorInfo $errored): WorkspaceSubmissionStatus {
        return new WorkspaceSubmissionStatus([
            'type' => 'errored',
            'value' => $errored,
        ]);
    }

    /**
     * @param value-of<RunningSubmissionState> $running
     * @return WorkspaceSubmissionStatus
     */
    public static function running(string $running): WorkspaceSubmissionStatus {
        return new WorkspaceSubmissionStatus([
            'type' => 'running',
            'value' => $running,
        ]);
    }

    /**
     * @param WorkspaceRunDetails $ran
     * @return WorkspaceSubmissionStatus
     */
    public static function ran(WorkspaceRunDetails $ran): WorkspaceSubmissionStatus {
        return new WorkspaceSubmissionStatus([
            'type' => 'ran',
            'value' => $ran,
        ]);
    }

    /**
     * @param WorkspaceRunDetails $traced
     * @return WorkspaceSubmissionStatus
     */
    public static function traced(WorkspaceRunDetails $traced): WorkspaceSubmissionStatus {
        return new WorkspaceSubmissionStatus([
            'type' => 'traced',
            'value' => $traced,
        ]);
    }

    /**
     * @return bool
     */
    public function isStopped(): bool {
        return is_null($this->value)&& $this->type === 'stopped';
    }

    /**
     * @return bool
     */
    public function isErrored(): bool {
        return $this->value instanceof ErrorInfo&& $this->type === 'errored';
    }

    /**
     * @return ErrorInfo
     */
    public function asErrored(): ErrorInfo {
        if (!($this->value instanceof ErrorInfo&& $this->type === 'errored')){
            throw new Exception(
                "Expected errored; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRunning(): bool {
        return $this->value instanceof RunningSubmissionState&& $this->type === 'running';
    }

    /**
     * @return value-of<RunningSubmissionState>
     */
    public function asRunning(): string {
        if (!($this->value instanceof RunningSubmissionState&& $this->type === 'running')){
            throw new Exception(
                "Expected running; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRan(): bool {
        return $this->value instanceof WorkspaceRunDetails&& $this->type === 'ran';
    }

    /**
     * @return WorkspaceRunDetails
     */
    public function asRan(): WorkspaceRunDetails {
        if (!($this->value instanceof WorkspaceRunDetails&& $this->type === 'ran')){
            throw new Exception(
                "Expected ran; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTraced(): bool {
        return $this->value instanceof WorkspaceRunDetails&& $this->type === 'traced';
    }

    /**
     * @return WorkspaceRunDetails
     */
    public function asTraced(): WorkspaceRunDetails {
        if (!($this->value instanceof WorkspaceRunDetails&& $this->type === 'traced')){
            throw new Exception(
                "Expected traced; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'stopped':
                $result['stopped'] = [];
                break;
            case 'errored':
                $value = $this->asErrored()->jsonSerialize();
                $result['errored'] = $value;
                break;
            case 'running':
                $value = $this->value;
                $result['running'] = $value;
                break;
            case 'ran':
                $value = $this->asRan()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'traced':
                $value = $this->asTraced()->jsonSerialize();
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
            case 'stopped':
                $args['value'] = null;
                break;
            case 'errored':
                if (!array_key_exists('errored', $data)){
                    throw new Exception(
                        "JSON data is missing property 'errored'",
                    );
                }
                
                if (!(is_array($data['errored']))){
                    throw new Exception(
                        "Expected property 'errored' in JSON data to be array, instead received " . get_debug_type($data['errored']),
                    );
                }
                $args['value'] = ErrorInfo::jsonDeserialize($data['errored']);
                break;
            case 'running':
                if (!array_key_exists('running', $data)){
                    throw new Exception(
                        "JSON data is missing property 'running'",
                    );
                }
                
                $args['value'] = $data['running'];
                break;
            case 'ran':
                $args['value'] = WorkspaceRunDetails::jsonDeserialize($data);
                break;
            case 'traced':
                $args['value'] = WorkspaceRunDetails::jsonDeserialize($data);
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
