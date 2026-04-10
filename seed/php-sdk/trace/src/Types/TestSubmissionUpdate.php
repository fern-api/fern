<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use DateTime;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Date;
use Seed\Core\Types\Union;

class TestSubmissionUpdate extends JsonSerializableType
{
    /**
     * @var DateTime $updateTime
     */
    #[JsonProperty('updateTime'), Date(Date::TYPE_DATETIME)]
    public DateTime $updateTime;

    /**
     * @var (
     *    TestSubmissionUpdateInfoZero
     *   |TestSubmissionUpdateInfoOne
     *   |TestSubmissionUpdateInfoTwo
     *   |TestSubmissionUpdateInfoThree
     *   |TestSubmissionUpdateInfoFour
     *   |TestSubmissionUpdateInfoFive
     * ) $updateInfo
     */
    #[JsonProperty('updateInfo'), Union(TestSubmissionUpdateInfoZero::class, TestSubmissionUpdateInfoOne::class, TestSubmissionUpdateInfoTwo::class, TestSubmissionUpdateInfoThree::class, TestSubmissionUpdateInfoFour::class, TestSubmissionUpdateInfoFive::class)]
    public TestSubmissionUpdateInfoZero|TestSubmissionUpdateInfoOne|TestSubmissionUpdateInfoTwo|TestSubmissionUpdateInfoThree|TestSubmissionUpdateInfoFour|TestSubmissionUpdateInfoFive $updateInfo;

    /**
     * @param array{
     *   updateTime: DateTime,
     *   updateInfo: (
     *    TestSubmissionUpdateInfoZero
     *   |TestSubmissionUpdateInfoOne
     *   |TestSubmissionUpdateInfoTwo
     *   |TestSubmissionUpdateInfoThree
     *   |TestSubmissionUpdateInfoFour
     *   |TestSubmissionUpdateInfoFive
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->updateTime = $values['updateTime'];
        $this->updateInfo = $values['updateInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
