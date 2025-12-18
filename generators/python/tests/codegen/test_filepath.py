from fern_python.codegen.filepath import Filepath


def test_filepath_to_str() -> None:
    filepath = Filepath(
        directories=(
            Filepath.DirectoryFilepathPart(module_name="dir1"),
            Filepath.DirectoryFilepathPart(module_name="dir2"),
        ),
        file=Filepath.FilepathPart(module_name="file"),
    )
    assert f"{filepath}" == "dir1/dir2/file.py"


def test_filepath_filters_empty_name_parts() -> None:
    """Test that empty or underscore-only name parts are filtered out."""
    filepath = Filepath(
        directories=(
            Filepath.DirectoryFilepathPart(module_name="dir1"),
            Filepath.DirectoryFilepathPart(module_name="_"),  # Empty name part
            Filepath.DirectoryFilepathPart(module_name="types"),
        ),
        file=Filepath.FilepathPart(module_name="project_environment"),
    )
    # Should filter out the "_" directory
    assert f"{filepath}" == "dir1/types/project_environment.py"


def test_filepath_to_module_filters_empty_name_parts() -> None:
    """Test that to_module() filters out empty or underscore-only name parts."""
    filepath = Filepath(
        directories=(
            Filepath.DirectoryFilepathPart(module_name="_"),  # Empty name part
            Filepath.DirectoryFilepathPart(module_name="types"),
        ),
        file=Filepath.FilepathPart(module_name="project_environment"),
    )
    module = filepath.to_module()
    # Should filter out the "_" directory, resulting in just "types.project_environment"
    assert module.path == ("types", "project_environment")


def test_filepath_filters_multiple_empty_name_parts() -> None:
    """Test that multiple empty name parts are all filtered out."""
    filepath = Filepath(
        directories=(
            Filepath.DirectoryFilepathPart(module_name="dir1"),
            Filepath.DirectoryFilepathPart(module_name="_"),
            Filepath.DirectoryFilepathPart(module_name=""),
            Filepath.DirectoryFilepathPart(module_name="types"),
            Filepath.DirectoryFilepathPart(module_name="_"),
        ),
        file=Filepath.FilepathPart(module_name="project_environment"),
    )
    # Should filter out all empty/underscore directories
    assert f"{filepath}" == "dir1/types/project_environment.py"
