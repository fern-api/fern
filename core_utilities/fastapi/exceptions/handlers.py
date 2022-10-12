import fastapi
import starlette

from .fern_http_exception import FernHTTPException


def fern_http_exception_handler(
    request: fastapi.requests.Request, exc: FernHTTPException
) -> fastapi.responses.JSONResponse:
    request.state.logger.info(f"{exc.__class__.__name__} in {request.url.path}", exc_info=exc)
    return exc.to_json_response()


def http_exception_handler(
    request: fastapi.requests.Request, exc: starlette.exceptions.HTTPException
) -> fastapi.responses.JSONResponse:
    request.state.logger.info(f"{exc.__class__.__name__} in {request.url.path}", exc_info=exc)
    return FernHTTPException(status_code=exc.status_code, content=exc.detail).to_json_response()


def default_exception_handler(request: fastapi.requests.Request, exc: Exception) -> fastapi.responses.JSONResponse:
    request.state.logger.info(f"{exc.__class__.__name__} in {request.url.path}", exc_info=exc)
    return FernHTTPException(status_code=500, content="Internal Server Error").to_json_response()
