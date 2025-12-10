# from typing import Callable, ParamSpec, TypeVar
#
# from celery import shared_task
#
# _P = ParamSpec("_P")
# _R = TypeVar("_R")
#
# @shared_task()
# def send_email(function: Callable[_P, _R], *args: _P.args, **kwargs: _P.kwargs) -> _R:
#     return function(*args, **kwargs)
