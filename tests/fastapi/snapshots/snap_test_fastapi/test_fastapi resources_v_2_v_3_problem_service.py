import abc
import inspect
import typing

import fastapi

from .....core.abstract_fern_service import AbstractFernService
from .....core.route_args import get_route_args
from ....commons.types.problem_id import ProblemId
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
    def getLightweightProblems(self) -> typing.List[LightweightProblemInfoV2]:
        ...

    @abc.abstractmethod
    def getProblems(self) -> typing.List[ProblemInfoV2]:
        ...

    @abc.abstractmethod
    def getLatestProblem(self, *, problem_id: ProblemId) -> ProblemInfoV2:
        ...

    @abc.abstractmethod
    def getProblemVersion(self, *, problem_id: ProblemId, problem_version: int) -> ProblemInfoV2:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_getLightweightProblems(router=router)
        cls.__init_getProblems(router=router)
        cls.__init_getLatestProblem(router=router)
        cls.__init_getProblemVersion(router=router)

    @classmethod
    def __init_getLightweightProblems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getLightweightProblems = router.get(  # type: ignore
            path="/problems-v2/lightweight-problem-info",
            response_model=typing.List[LightweightProblemInfoV2],
            **get_route_args(cls.getLightweightProblems),
        )(cls.getLightweightProblems)

    @classmethod
    def __init_getProblems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getProblems = router.get(  # type: ignore
            path="/problems-v2/problem-info",
            response_model=typing.List[ProblemInfoV2],
            **get_route_args(cls.getProblems),
        )(cls.getProblems)

    @classmethod
    def __init_getLatestProblem(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "problem_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getLatestProblem = router.get(  # type: ignore
            path="/problems-v2/problem-info/{problem_id}",
            response_model=ProblemInfoV2,
            **get_route_args(cls.getLatestProblem),
        )(cls.getLatestProblem)

    @classmethod
    def __init_getProblemVersion(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
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

        cls.getProblemVersion = router.get(  # type: ignore
            path="/problems-v2/problem-info/{problem_id}/version/{problem_version}",
            response_model=ProblemInfoV2,
            **get_route_args(cls.getProblemVersion),
        )(cls.getProblemVersion)
