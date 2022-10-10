import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from ..commons.types.language import Language


class AbstractSysPropCrudService(AbstractFernService):
    """
    AbstractSysPropCrudService is an abstract class containing the methods that your
    SysPropCrudService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def setNumWarmInstances(self, *, language: Language, num_warm_instances: int) -> None:
        ...

    @abc.abstractmethod
    def getNumWarmInstances(self) -> typing.Dict[Language, int]:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_setNumWarmInstances(router=router)
        cls.__init_getNumWarmInstances(router=router)

    @classmethod
    def __init_setNumWarmInstances(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "language":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "num_warm_instances":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.setNumWarmInstances = router.put(  # type: ignore
            path="/sysprop/num-warm-instances/{language}/{num_warm_instances}",
            **get_route_args(cls.setNumWarmInstances),
        )(cls.setNumWarmInstances)

    @classmethod
    def __init_getNumWarmInstances(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getNumWarmInstances = router.get(  # type: ignore
            path="/sysprop/num-warm-instances",
            response_model=typing.Dict[Language, int],
            **get_route_args(cls.getNumWarmInstances),
        )(cls.getNumWarmInstances)
