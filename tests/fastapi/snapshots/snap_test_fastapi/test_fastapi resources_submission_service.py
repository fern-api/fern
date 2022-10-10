import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from ..commons.types.language import Language
from .types.execution_session_response import ExecutionSessionResponse
from .types.get_execution_session_state_response import GetExecutionSessionStateResponse


class AbstractExecutionSesssionManagementService(AbstractFernService):
    """
    AbstractExecutionSesssionManagementService is an abstract class containing the methods that your
    ExecutionSesssionManagementService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def create_execution_session(self, *, language: Language) -> ExecutionSessionResponse:
        ...

    @abc.abstractmethod
    def get_execution_session(self, *, session_id: str) -> typing.Optional[ExecutionSessionResponse]:
        ...

    @abc.abstractmethod
    def stop_execution_session(self, *, session_id: str) -> None:
        ...

    @abc.abstractmethod
    def get_execution_sessions_state(self) -> GetExecutionSessionStateResponse:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_create_execution_session(router=router)
        cls.__init_get_execution_session(router=router)
        cls.__init_stop_execution_session(router=router)
        cls.__init_get_execution_sessions_state(router=router)

    @classmethod
    def __init_create_execution_session(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.create_execution_session)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "language":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.create_execution_session = router.post(  # type: ignore
            path="/sessions/create-session/{language}",
            response_model=ExecutionSessionResponse,
            **get_route_args(cls.create_execution_session),
        )(cls.create_execution_session)

    @classmethod
    def __init_get_execution_session(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_execution_session)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "session_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_execution_session = router.get(  # type: ignore
            path="/sessions/{session_id}",
            response_model=typing.Optional[ExecutionSessionResponse],
            **get_route_args(cls.get_execution_session),
        )(cls.get_execution_session)

    @classmethod
    def __init_stop_execution_session(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.stop_execution_session)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "session_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.stop_execution_session = router.delete(  # type: ignore
            path="/sessions/stop/{session_id}", **get_route_args(cls.stop_execution_session)
        )(cls.stop_execution_session)

    @classmethod
    def __init_get_execution_sessions_state(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_execution_sessions_state)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_execution_sessions_state = router.get(  # type: ignore
            path="/sessions/execution-sessions-state",
            response_model=GetExecutionSessionStateResponse,
            **get_route_args(cls.get_execution_sessions_state),
        )(cls.get_execution_sessions_state)
