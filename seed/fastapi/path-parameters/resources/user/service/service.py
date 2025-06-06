# This file was auto-generated by Fern from our API Definition.

import abc
import functools
import inspect
import logging
import typing

import fastapi
from ....core.abstract_fern_service import AbstractFernService
from ....core.exceptions.fern_http_exception import FernHTTPException
from ....core.route_args import get_route_args
from ..types.user import User


class AbstractUserService(AbstractFernService):
    """
    AbstractUserService is an abstract class containing the methods that you should implement.

    Each method is associated with an API route, which will be registered
    with FastAPI when you register your implementation using Fern's register()
    function.
    """

    @abc.abstractmethod
    def get_user(self, *, user_id: str) -> User: ...

    @abc.abstractmethod
    def create_user(self, *, body: User) -> User: ...

    @abc.abstractmethod
    def update_user(self, *, body: User, user_id: str) -> User: ...

    @abc.abstractmethod
    def search_users(self, *, user_id: str, limit: typing.Optional[int] = None) -> typing.Sequence[User]: ...

    """
    Below are internal methods used by Fern to register your implementation.
    You can ignore them.
    """

    @classmethod
    def _init_fern(cls, router: fastapi.APIRouter) -> None:
        cls.__init_get_user(router=router)
        cls.__init_create_user(router=router)
        cls.__init_update_user(router=router)
        cls.__init_search_users(router=router)

    @classmethod
    def __init_get_user(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.get_user)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "user_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls.get_user, "__signature__", endpoint_function.replace(parameters=new_parameters))

        @functools.wraps(cls.get_user)
        def wrapper(*args: typing.Any, **kwargs: typing.Any) -> User:
            try:
                return cls.get_user(*args, **kwargs)
            except FernHTTPException as e:
                logging.getLogger(f"{cls.__module__}.{cls.__name__}").warn(
                    f"Endpoint 'get_user' unexpectedly threw {e.__class__.__name__}. "
                    + f"If this was intentional, please add {e.__class__.__name__} to "
                    + "the endpoint's errors list in your Fern Definition."
                )
                raise e

        # this is necessary for FastAPI to find forward-ref'ed type hints.
        # https://github.com/tiangolo/fastapi/pull/5077
        wrapper.__globals__.update(cls.get_user.__globals__)

        router.get(
            path="/{tenant_id}/user/{user_id}",
            response_model=User,
            description=AbstractUserService.get_user.__doc__,
            **get_route_args(cls.get_user, default_tag="user"),
        )(wrapper)

    @classmethod
    def __init_create_user(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.create_user)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "body":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls.create_user, "__signature__", endpoint_function.replace(parameters=new_parameters))

        @functools.wraps(cls.create_user)
        def wrapper(*args: typing.Any, **kwargs: typing.Any) -> User:
            try:
                return cls.create_user(*args, **kwargs)
            except FernHTTPException as e:
                logging.getLogger(f"{cls.__module__}.{cls.__name__}").warn(
                    f"Endpoint 'create_user' unexpectedly threw {e.__class__.__name__}. "
                    + f"If this was intentional, please add {e.__class__.__name__} to "
                    + "the endpoint's errors list in your Fern Definition."
                )
                raise e

        # this is necessary for FastAPI to find forward-ref'ed type hints.
        # https://github.com/tiangolo/fastapi/pull/5077
        wrapper.__globals__.update(cls.create_user.__globals__)

        router.post(
            path="/{tenant_id}/user/",
            response_model=User,
            description=AbstractUserService.create_user.__doc__,
            **get_route_args(cls.create_user, default_tag="user"),
        )(wrapper)

    @classmethod
    def __init_update_user(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.update_user)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "body":
                new_parameters.append(parameter.replace(default=fastapi.Body(...)))
            elif parameter_name == "user_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            else:
                new_parameters.append(parameter)
        setattr(cls.update_user, "__signature__", endpoint_function.replace(parameters=new_parameters))

        @functools.wraps(cls.update_user)
        def wrapper(*args: typing.Any, **kwargs: typing.Any) -> User:
            try:
                return cls.update_user(*args, **kwargs)
            except FernHTTPException as e:
                logging.getLogger(f"{cls.__module__}.{cls.__name__}").warn(
                    f"Endpoint 'update_user' unexpectedly threw {e.__class__.__name__}. "
                    + f"If this was intentional, please add {e.__class__.__name__} to "
                    + "the endpoint's errors list in your Fern Definition."
                )
                raise e

        # this is necessary for FastAPI to find forward-ref'ed type hints.
        # https://github.com/tiangolo/fastapi/pull/5077
        wrapper.__globals__.update(cls.update_user.__globals__)

        router.patch(
            path="/{tenant_id}/user/{user_id}",
            response_model=User,
            description=AbstractUserService.update_user.__doc__,
            **get_route_args(cls.update_user, default_tag="user"),
        )(wrapper)

    @classmethod
    def __init_search_users(cls, router: fastapi.APIRouter) -> None:
        endpoint_function = inspect.signature(cls.search_users)
        new_parameters: typing.List[inspect.Parameter] = []
        for index, (parameter_name, parameter) in enumerate(endpoint_function.parameters.items()):
            if index == 0:
                new_parameters.append(parameter.replace(default=fastapi.Depends(cls)))
            elif parameter_name == "user_id":
                new_parameters.append(parameter.replace(default=fastapi.Path(...)))
            elif parameter_name == "limit":
                new_parameters.append(parameter.replace(default=fastapi.Query(default=None)))
            else:
                new_parameters.append(parameter)
        setattr(cls.search_users, "__signature__", endpoint_function.replace(parameters=new_parameters))

        @functools.wraps(cls.search_users)
        def wrapper(*args: typing.Any, **kwargs: typing.Any) -> typing.Sequence[User]:
            try:
                return cls.search_users(*args, **kwargs)
            except FernHTTPException as e:
                logging.getLogger(f"{cls.__module__}.{cls.__name__}").warn(
                    f"Endpoint 'search_users' unexpectedly threw {e.__class__.__name__}. "
                    + f"If this was intentional, please add {e.__class__.__name__} to "
                    + "the endpoint's errors list in your Fern Definition."
                )
                raise e

        # this is necessary for FastAPI to find forward-ref'ed type hints.
        # https://github.com/tiangolo/fastapi/pull/5077
        wrapper.__globals__.update(cls.search_users.__globals__)

        router.get(
            path="/{tenant_id}/user/{user_id}/search",
            response_model=typing.Sequence[User],
            description=AbstractUserService.search_users.__doc__,
            **get_route_args(cls.search_users, default_tag="user"),
        )(wrapper)
