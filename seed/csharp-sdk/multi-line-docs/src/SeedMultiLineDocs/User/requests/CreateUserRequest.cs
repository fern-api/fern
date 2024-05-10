namespace SeedMultiLineDocs;

public class CreateUserRequest
{
    /// <summary>
    /// The name of the user to create.
    /// This name is unique to each user.
    ///
    /// </summary>
    public string Name { get; init; }

    /// <summary>
    /// The age of the user.
    /// This propery is not required.
    ///
    /// </summary>
    public int? Age { get; init; }
}
