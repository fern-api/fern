import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from ..commons.types.problem_id import ProblemId


class AbstractHomepageProblemService(AbstractFernService):
    """
    AbstractHomepageProblemService is an abstract class containing the methods that your
    HomepageProblemService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def getHomepageProblems(self) -> typing.List[ProblemId]:
        ...

    @abc.abstractmethod
    def setHomepageProblems(self, *, request: typing.List[ProblemId]) -> None:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_getHomepageProblems(router=router)
        cls.__init_setHomepageProblems(router=router)

    @classmethod
    def __init_getHomepageProblems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.getHomepageProblems)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getHomepageProblems = router.get(  # type: ignore
            path="/homepage-problems/", response_model=typing.List[ProblemId], **get_route_args(cls.getHomepageProblems)
        )(cls.getHomepageProblems)

    @classmethod
    def __init_setHomepageProblems(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.setHomepageProblems)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "request":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.setHomepageProblems = router.post(  # type: ignore
            path="/homepage-problems/", **get_route_args(cls.setHomepageProblems)
        )(cls.setHomepageProblems)
