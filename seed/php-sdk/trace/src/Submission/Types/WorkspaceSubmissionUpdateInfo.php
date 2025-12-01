<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class WorkspaceSubmissionUpdateInfo extends JsonSerializableType
{
    /**
     * @var (
     *    'running'
     *   |'ran'
     *   |'stopped'
     *   |'traced'
     *   |'tracedV2'
     *   |'errored'
     *   |'finished'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
     *   |null
     *   |WorkspaceTracedUpdate
     *   |ErrorInfo
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'running'
     *   |'ran'
     *   |'stopped'
     *   |'traced'
     *   |'tracedV2'
     *   |'errored'
     *   |'finished'
     *   |'_unknown'
     * ),
     *   value: (
     *    value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
     *   |null
     *   |WorkspaceTracedUpdate
     *   |ErrorInfo
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
     * @param value-of<RunningSubmissionState> $running
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function running(string $running): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'running',
            'value' => $running,
        ]);
    }

    /**
     * @param WorkspaceRunDetails $ran
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function ran(WorkspaceRunDetails $ran): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'ran',
            'value' => $ran,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function stopped(): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'stopped',
            'value' => null,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function traced(): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'traced',
            'value' => null,
        ]);
    }

    /**
     * @param WorkspaceTracedUpdate $tracedV2
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function tracedV2(WorkspaceTracedUpdate $tracedV2): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'tracedV2',
            'value' => $tracedV2,
        ]);
    }

    /**
     * @param ErrorInfo $errored
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function errored(ErrorInfo $errored): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'errored',
            'value' => $errored,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function finished(): WorkspaceSubmissionUpdateInfo {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'finished',
            'value' => null,
        ]);
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
    public function isStopped(): bool {
        return is_null($this->value)&& $this->type === 'stopped';
    }

    /**
     * @return bool
     */
    public function isTraced(): bool {
        return is_null($this->value)&& $this->type === 'traced';
    }

    /**
     * @return bool
     */
    public function isTracedV2(): bool {
        return $this->value instanceof WorkspaceTracedUpdate&& $this->type === 'tracedV2';
    }

    /**
     * @return WorkspaceTracedUpdate
     */
    public function asTracedV2(): WorkspaceTracedUpdate {
        if (!($this->value instanceof WorkspaceTracedUpdate&& $this->type === 'tracedV2')){
            throw new Exception(
                "Expected tracedV2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
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
    public function isFinished(): bool {
        return is_null($this->value)&& $this->type === 'finished';
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
            case 'running':
                $value = $this->value;
                $result['running'] = $value;
                break;
            case 'ran':
                $value = $this->asRan()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'stopped':
                $result['stopped'] = [];
                break;
            case 'traced':
                $result['traced'] = [];
                break;
            case 'tracedV2':
                $value = $this->asTracedV2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'errored':
                $value = $this->asErrored()->jsonSerialize();
                $result['errored'] = $value;
                break;
            case 'finished':
                $result['finished'] = [];
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
            case 'stopped':
                $args['value'] = null;
                break;
            case 'traced':
                $args['value'] = null;
                break;
            case 'tracedV2':
                $args['value'] = WorkspaceTracedUpdate::jsonDeserialize($data);
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
            case 'finished':
                $args['value'] = null;
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
