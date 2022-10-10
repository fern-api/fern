import enum
import typing

T_Result = typing.TypeVar("T_Result")


class RunningSubmissionState(str, enum.Enum):
    QUEUEING_SUBMISSION = "QUEUEING_SUBMISSION"
    KILLING_HISTORICAL_SUBMISSIONS = "KILLING_HISTORICAL_SUBMISSIONS"
    WRITING_SUBMISSION_TO_FILE = "WRITING_SUBMISSION_TO_FILE"
    COMPILING_SUBMISSION = "COMPILING_SUBMISSION"
    RUNNING_SUBMISSION = "RUNNING_SUBMISSION"

    def visit(
        self,
        queueing_submission: typing.Callable[[], T_Result],
        killing_historical_submissions: typing.Callable[[], T_Result],
        writing_submission_to_file: typing.Callable[[], T_Result],
        compiling_submission: typing.Callable[[], T_Result],
        running_submission: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.value == "QUEUEING_SUBMISSION":
            return queueing_submission()
        if self.value == "KILLING_HISTORICAL_SUBMISSIONS":
            return killing_historical_submissions()
        if self.value == "WRITING_SUBMISSION_TO_FILE":
            return writing_submission_to_file()
        if self.value == "COMPILING_SUBMISSION":
            return compiling_submission()
        if self.value == "RUNNING_SUBMISSION":
            return running_submission()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
