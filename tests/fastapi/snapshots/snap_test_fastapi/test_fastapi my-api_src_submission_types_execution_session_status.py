import enum
import typing

T_Result = typing.TypeVar("T_Result")


class ExecutionSessionStatus(str, enum.Enum):
    CREATING_CONTAINER = "CREATING_CONTAINER"
    PROVISIONING_CONTAINER = "PROVISIONING_CONTAINER"
    PENDING_CONTAINER = "PENDING_CONTAINER"
    RUNNING_CONTAINER = "RUNNING_CONTAINER"
    LIVE_CONTAINER = "LIVE_CONTAINER"
    FAILED_TO_LAUNCH = "FAILED_TO_LAUNCH"

    def visit(
        self,
        creating_container: typing.Callable[[], T_Result],
        provisioning_container: typing.Callable[[], T_Result],
        pending_container: typing.Callable[[], T_Result],
        running_container: typing.Callable[[], T_Result],
        live_container: typing.Callable[[], T_Result],
        failed_to_launch: typing.Callable[[], T_Result],
    ) -> T_Result:
        if self.value == "CREATING_CONTAINER":
            return creating_container()
        if self.value == "PROVISIONING_CONTAINER":
            return provisioning_container()
        if self.value == "PENDING_CONTAINER":
            return pending_container()
        if self.value == "RUNNING_CONTAINER":
            return running_container()
        if self.value == "LIVE_CONTAINER":
            return live_container()
        if self.value == "FAILED_TO_LAUNCH":
            return failed_to_launch()

        # the above checks are exhaustive, but this is necessary to satisfy the type checker
        raise RuntimeError()
