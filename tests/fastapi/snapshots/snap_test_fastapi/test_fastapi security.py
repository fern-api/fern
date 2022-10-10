import fastapi

from .core.security.bearer import BearerToken, HTTPBearer

ApiAuth: BearerToken


def FernAuth(auth: BearerToken = fastapi.Depends(HTTPBearer)) -> BearerToken:
    return auth
