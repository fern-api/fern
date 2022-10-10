import abc
import inspect
import typing

import fastapi

from ....core.abstract_fern_service import AbstractFernService
from ....core.route_args import get_route_args
from .types.lightweight_problem_info_v_2 import LightweightProblemInfoV2
from .types.problem_info_v_2 import ProblemInfoV2


class AbstractProblemInfoServicV2(AbstractFernService):
    """
    AbstractProblemInfoServicV2 is an abstract class containing the methods that your
    ProblemInfoServicV2 implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def get_lightweight_problems(self) -> typing.List[LightweightProblemInfoV2]:
        ...

    @abc.abstractmethod
    def get_problems(self) -> typing.List[ProblemInfoV2]:
        ...

    @abc.abstractmethod
    def get_latest_problem(self, *, problem_id: str) -> ProblemInfoV2:
        ...

    @abc.abstractmethod
    def get_problem_version(self, *, problem_id: str, problem_version: int) -> ProblemInfoV2:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_get_lightweight_problems(router=router)
        cls.__init_get_problems(router=router)
        cls.__init_get_latest_problem(router=router)
        cls.__init_get_problem_version(router=router)

    @classmethod
    def __init_get_lightweight_problems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_lightweight_problems)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_lightweight_problems = router.get(  # type: ignore
            path="/problems-v2/lightweight-problem-info",
            response_model=typing.List[LightweightProblemInfoV2],
            **get_route_args(cls.get_lightweight_problems),
        )(cls.get_lightweight_problems)

    @classmethod
    def __init_get_problems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_problems)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_problems = router.get(  # type: ignore
            path="/problems-v2/problem-info",
            response_model=typing.List[ProblemInfoV2],
            **get_route_args(cls.get_problems),
        )(cls.get_problems)

    @classmethod
    def __init_get_latest_problem(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_latest_problem)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "problem_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_latest_problem = router.get(  # type: ignore
            path="/problems-v2/problem-info/{problem_id}",
            response_model=ProblemInfoV2,
            **get_route_args(cls.get_latest_problem),
        )(cls.get_latest_problem)

    @classmethod
    def __init_get_problem_version(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_problem_version)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "problem_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "problem_version":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.get_problem_version = router.get(  # type: ignore
            path="/problems-v2/problem-info/{problem_id}/version/{problem_version}",
            response_model=ProblemInfoV2,
            **get_route_args(cls.get_problem_version),
        )(cls.get_problem_version)
