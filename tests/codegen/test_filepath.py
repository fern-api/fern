from fern_python.codegen.filepath import Filepath


def test_filepath_to_str() -> None:
    filepath = Filepath(
        directories=(
            Filepath.DirectoryFilepathPart(module_name="dir1"),
            Filepath.DirectoryFilepathPart(module_name="dir2"),
        ),
        file=Filepath.FilepathPart(module_name="file"),
    )
    assert filepath.to_str() == "dir1/dir2/file.py"
