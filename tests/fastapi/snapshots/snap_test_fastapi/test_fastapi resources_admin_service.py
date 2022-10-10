import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from ..submission.types.submission_id import SubmissionId
from ..submission.types.test_submission_status import TestSubmissionStatus
from ..submission.types.test_submission_update import TestSubmissionUpdate
from ..submission.types.trace_response_v_2 import TraceResponseV2
from ..submission.types.workspace_submission_status import WorkspaceSubmissionStatus
from ..submission.types.workspace_submission_update import WorkspaceSubmissionUpdate
from ..v_2.problem.types.test_case_id import TestCaseId
from .types.store_traced_test_case_request import StoreTracedTestCaseRequest
from .types.store_traced_workspace_request import StoreTracedWorkspaceRequest


class AbstractAdminService(AbstractFernService):
    """
    AbstractAdminService is an abstract class containing the methods that your
    AdminService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def updateTestSubmissionStatus(self, *, request: TestSubmissionStatus, submission_id: SubmissionId) -> None:
        ...

    @abc.abstractmethod
    def sendTestSubmissionUpdate(self, *, request: TestSubmissionUpdate, submission_id: SubmissionId) -> None:
        ...

    @abc.abstractmethod
    def updateWorkspaceSubmissionStatus(
        self, *, request: WorkspaceSubmissionStatus, submission_id: SubmissionId
    ) -> None:
        ...

    @abc.abstractmethod
    def sendWorkspaceSubmissionUpdate(self, *, request: WorkspaceSubmissionUpdate, submission_id: SubmissionId) -> None:
        ...

    @abc.abstractmethod
    def storeTracedTestCase(
        self, *, request: StoreTracedTestCaseRequest, submission_id: SubmissionId, test_case_id: str
    ) -> None:
        ...

    @abc.abstractmethod
    def storeTracedTestCaseV2(
        self, *, request: typing.List[TraceResponseV2], submission_id: SubmissionId, test_case_id: TestCaseId
    ) -> None:
        ...

    @abc.abstractmethod
    def storeTracedWorkspace(self, *, request: StoreTracedWorkspaceRequest, submission_id: SubmissionId) -> None:
        ...

    @abc.abstractmethod
    def storeTracedWorkspaceV2(self, *, request: typing.List[TraceResponseV2], submission_id: SubmissionId) -> None:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_updateTestSubmissionStatus(router=router)
        cls.__init_sendTestSubmissionUpdate(router=router)
        cls.__init_updateWorkspaceSubmissionStatus(router=router)
        cls.__init_sendWorkspaceSubmissionUpdate(router=router)
        cls.__init_storeTracedTestCase(router=router)
        cls.__init_storeTracedTestCaseV2(router=router)
        cls.__init_storeTracedWorkspace(router=router)
        cls.__init_storeTracedWorkspaceV2(router=router)

    @classmethod
    def __init_updateTestSubmissionStatus(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.updateTestSubmissionStatus = router.post(  # type: ignore
            path="/admin/store-test-submission-status/{submission_id}", **get_route_args(cls.updateTestSubmissionStatus)
        )(cls.updateTestSubmissionStatus)

    @classmethod
    def __init_sendTestSubmissionUpdate(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.sendTestSubmissionUpdate = router.post(  # type: ignore
            path="/admin/store-test-submission-status-v2/{submission_id}",
            **get_route_args(cls.sendTestSubmissionUpdate),
        )(cls.sendTestSubmissionUpdate)

    @classmethod
    def __init_updateWorkspaceSubmissionStatus(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.updateWorkspaceSubmissionStatus = router.post(  # type: ignore
            path="/admin/store-workspace-submission-status/{submission_id}",
            **get_route_args(cls.updateWorkspaceSubmissionStatus),
        )(cls.updateWorkspaceSubmissionStatus)

    @classmethod
    def __init_sendWorkspaceSubmissionUpdate(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.sendWorkspaceSubmissionUpdate = router.post(  # type: ignore
            path="/admin/store-workspace-submission-status-v2/{submission_id}",
            **get_route_args(cls.sendWorkspaceSubmissionUpdate),
        )(cls.sendWorkspaceSubmissionUpdate)

    @classmethod
    def __init_storeTracedTestCase(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "test_case_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.storeTracedTestCase = router.post(  # type: ignore
            path="/admin/store-test-trace/submission/{submission_id}/testCase/{test_case_id}",
            **get_route_args(cls.storeTracedTestCase),
        )(cls.storeTracedTestCase)

    @classmethod
    def __init_storeTracedTestCaseV2(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "test_case_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.storeTracedTestCaseV2 = router.post(  # type: ignore
            path="/admin/store-test-trace-v2/submission/{submission_id}/testCase/{test_case_id}",
            **get_route_args(cls.storeTracedTestCaseV2),
        )(cls.storeTracedTestCaseV2)

    @classmethod
    def __init_storeTracedWorkspace(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.storeTracedWorkspace = router.post(  # type: ignore
            path="/admin/store-workspace-trace/submission/{submission_id}", **get_route_args(cls.storeTracedWorkspace)
        )(cls.storeTracedWorkspace)

    @classmethod
    def __init_storeTracedWorkspaceV2(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "submission_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.storeTracedWorkspaceV2 = router.post(  # type: ignore
            path="/admin/store-workspace-trace-v2/submission/{submission_id}",
            **get_route_args(cls.storeTracedWorkspaceV2),
        )(cls.storeTracedWorkspaceV2)
