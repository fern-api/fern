<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class SubmissionStatusForTestCase extends JsonSerializableType
{
    /**
     * @var (
     *    'graded'
     *   |'gradedV2'
     *   |'traced'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    TestCaseResultWithStdout
     *   |TestCaseGrade
     *   |TracedTestCase
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'graded'
     *   |'gradedV2'
     *   |'traced'
     *   |'_unknown'
     * ),
     *   value: (
     *    TestCaseResultWithStdout
     *   |TestCaseGrade
     *   |TracedTestCase
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
     * @param TestCaseResultWithStdout $graded
     * @return SubmissionStatusForTestCase
     */
    public static function graded(TestCaseResultWithStdout $graded): SubmissionStatusForTestCase {
        return new SubmissionStatusForTestCase([
            'type' => 'graded',
            'value' => $graded,
        ]);
    }

    /**
     * @param TestCaseGrade $gradedV2
     * @return SubmissionStatusForTestCase
     */
    public static function gradedV2(TestCaseGrade $gradedV2): SubmissionStatusForTestCase {
        return new SubmissionStatusForTestCase([
            'type' => 'gradedV2',
            'value' => $gradedV2,
        ]);
    }

    /**
     * @param TracedTestCase $traced
     * @return SubmissionStatusForTestCase
     */
    public static function traced(TracedTestCase $traced): SubmissionStatusForTestCase {
        return new SubmissionStatusForTestCase([
            'type' => 'traced',
            'value' => $traced,
        ]);
    }

    /**
     * @return bool
     */
    public function isGraded(): bool {
        return $this->value instanceof TestCaseResultWithStdout&& $this->type === 'graded';
    }

    /**
     * @return TestCaseResultWithStdout
     */
    public function asGraded(): TestCaseResultWithStdout {
        if (!($this->value instanceof TestCaseResultWithStdout&& $this->type === 'graded')){
            throw new Exception(
                "Expected graded; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isGradedV2(): bool {
        return $this->value instanceof TestCaseGrade&& $this->type === 'gradedV2';
    }

    /**
     * @return TestCaseGrade
     */
    public function asGradedV2(): TestCaseGrade {
        if (!($this->value instanceof TestCaseGrade&& $this->type === 'gradedV2')){
            throw new Exception(
                "Expected gradedV2; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTraced(): bool {
        return $this->value instanceof TracedTestCase&& $this->type === 'traced';
    }

    /**
     * @return TracedTestCase
     */
    public function asTraced(): TracedTestCase {
        if (!($this->value instanceof TracedTestCase&& $this->type === 'traced')){
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
            case 'graded':
                $value = $this->asGraded()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'gradedV2':
                $value = $this->asGradedV2()->jsonSerialize();
                $result['gradedV2'] = $value;
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
            case 'graded':
                $args['value'] = TestCaseResultWithStdout::jsonDeserialize($data);
                break;
            case 'gradedV2':
                if (!array_key_exists('gradedV2', $data)){
                    throw new Exception(
                        "JSON data is missing property 'gradedV2'",
                    );
                }
                
                if (!(is_array($data['gradedV2']))){
                    throw new Exception(
                        "Expected property 'gradedV2' in JSON data to be array, instead received " . get_debug_type($data['gradedV2']),
                    );
                }
                $args['value'] = TestCaseGrade::jsonDeserialize($data['gradedV2']);
                break;
            case 'traced':
                $args['value'] = TracedTestCase::jsonDeserialize($data);
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
