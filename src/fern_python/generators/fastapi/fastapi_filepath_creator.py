from typing import List

from fern_python.declaration_referencer import FernFilepathCreator


class FastApiFilepathCreator(FernFilepathCreator):
    def _get_folders_inside_src(self) -> List[str]:
        return []
