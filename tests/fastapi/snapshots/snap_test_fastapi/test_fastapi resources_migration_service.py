import abc
import inspect
import typing

import fastapi

from ...core.abstract_fern_service import AbstractFernService
from ...core.route_args import get_route_args
from .types.migration import Migration


class AbstractMigrationInfoService(AbstractFernService):
    """
    AbstractMigrationInfoService is an abstract class containing the methods that your
    MigrationInfoService implementation should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def getAttemptedMigrations(self) -> typing.List[Migration]:
        ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_getAttemptedMigrations(router=router)

    @classmethod
    def __init_getAttemptedMigrations(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature()
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            else:
                new_parameters.append(parameter)
        setattr(cls, "__signature__", endpoint_function.replace(parameters=new_parameters))

        cls.getAttemptedMigrations = router.get(  # type: ignore
            path="/migration-info/all",
            response_model=typing.List[Migration],
            **get_route_args(cls.getAttemptedMigrations),
        )(cls.getAttemptedMigrations)
