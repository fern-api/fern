# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot
from snapshottest.file import FileSnapshot


snapshots = Snapshot()

snapshots['test_file_upload_sdk __init__'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk __init__.py')

snapshots['test_file_upload_sdk client'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk client.py')

snapshots['test_file_upload_sdk core___init__'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk core___init__.py')

snapshots['test_file_upload_sdk core_api_error'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk core_api_error.py')

snapshots['test_file_upload_sdk core_datetime_utils'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk core_datetime_utils.py')

snapshots['test_file_upload_sdk core_jsonable_encoder'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk core_jsonable_encoder.py')

snapshots['test_file_upload_sdk core_remove_none_from_headers'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk core_remove_none_from_headers.py')

snapshots['test_file_upload_sdk filepaths'] = [
    '__init__.py',
    'client.py',
    'core/__init__.py',
    'core/api_error.py',
    'core/datetime_utils.py',
    'core/jsonable_encoder.py',
    'core/remove_none_from_headers.py',
    'resources/__init__.py',
    'resources/movie/__init__.py',
    'resources/movie/client.py',
    'resources/movie/types/__init__.py',
    'resources/movie/types/movie_id.py'
]

snapshots['test_file_upload_sdk resources___init__'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk resources___init__.py')

snapshots['test_file_upload_sdk resources_movie___init__'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk resources_movie___init__.py')

snapshots['test_file_upload_sdk resources_movie_client'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk resources_movie_client.py')

snapshots['test_file_upload_sdk resources_movie_types___init__'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk resources_movie_types___init__.py')

snapshots['test_file_upload_sdk resources_movie_types_movie_id'] = FileSnapshot('snap_test_sdk/test_file_upload_sdk resources_movie_types_movie_id.py')
