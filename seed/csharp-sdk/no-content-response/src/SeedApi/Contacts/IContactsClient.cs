namespace SeedApi;

public partial interface IContactsClient
{
    /// <summary>
    /// Creates a new contact. Returns 200 with the contact or 204 with no content.
    /// </summary>
    WithRawResponseTask<Contact?> CreateAsync(
        CreateContactRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a contact by ID. Returns 200 with the contact.
    /// </summary>
    WithRawResponseTask<Contact> GetAsync(
        GetContactsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
