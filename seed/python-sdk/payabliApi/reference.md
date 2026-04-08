# Reference
## Bill
<details><summary><code>client.bill.<a href="src/seed/bill/client.py">add_bill</a>(...) -> BillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a bill in an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, BillItem, VendorData, FileContent
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.add_bill(
    entry="8cfec329267",
    bill_number="ABC-123",
    net_amount=3762.87,
    bill_date=datetime.date.fromisoformat("2024-07-01"),
    due_date=datetime.date.fromisoformat("2024-07-01"),
    comments="Deposit for materials",
    bill_items=[
        BillItem(
            item_product_code="M-DEPOSIT",
            item_product_name="Materials deposit",
            item_description="Deposit for materials",
            item_commodity_code="010",
            item_unit_of_measure="SqFt",
            item_cost=5,
            item_qty=1,
            item_mode=0,
            item_categories=[
                "deposits"
            ],
            item_total_amount=123,
            item_tax_amount=7,
            item_tax_rate=0.075,
        )
    ],
    mode=0,
    accounting_field_1="MyInternalId",
    vendor=VendorData(
        vendor_number="1234-A",
    ),
    end_date=datetime.date.fromisoformat("2024-07-01"),
    frequency="monthly",
    terms="NET30",
    status=-99,
    attachments=[
        FileContent(
            ftype="pdf",
            filename="my-doc.pdf",
            furl="https://mysite.com/my-doc.pdf",
        )
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request:** `BillOutData` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">delete_attached_from_bill</a>(...) -> BillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a file attached to a bill.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.delete_attached_from_bill(
    filename="0_Bill.pdf",
    id_bill=285,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**filename:** `str` 

The filename in Payabli. Filename is `zipName` in response to a
request to `/api/Invoice/{idInvoice}`. Here, the filename is
`0_Bill.pdf`. 

```json
  "DocumentsRef": {
    "zipfile": "inva_269.zip",
    "filelist": [
      {
        "originalName": "Bill.pdf",
        "zipName": "0_Bill.pdf",
        "descriptor": null
      }
    ]
  }
  ```
    
</dd>
</dl>

<dl>
<dd>

**return_object:** `typing.Optional[bool]` — When `true`, the request returns the file content as a Base64-encoded string.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">delete_bill</a>(...) -> BillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a bill by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.delete_bill(
    id_bill=285,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">edit_bill</a>(...) -> EditBillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a bill by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.edit_bill(
    id_bill=285,
    net_amount=3762.87,
    bill_date=datetime.date.fromisoformat("2025-07-01"),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**request:** `BillOutData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">get_attached_from_bill</a>(...) -> FileContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a file attached to a bill, either as a binary file or as a Base64-encoded string.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.get_attached_from_bill(
    filename="0_Bill.pdf",
    id_bill=285,
    return_object=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**filename:** `str` 

The filename in Payabli. Filename is `zipName` in response to a request to `/api/Invoice/{idInvoice}`. Here, the filename is `0_Bill.pdf``. 
"DocumentsRef": {
  "zipfile": "inva_269.zip",
  "filelist": [
    {
      "originalName": "Bill.pdf",
      "zipName": "0_Bill.pdf",
      "descriptor": null
    }
  ]
}
    
</dd>
</dl>

<dl>
<dd>

**return_object:** `typing.Optional[bool]` — When `true`, the request returns the file content as a Base64-encoded string.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">get_bill</a>(...) -> GetBillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a bill by ID from an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.get_bill(
    id_bill=285,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">list_bills</a>(...) -> BillQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of bills for an entrypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.list_bills(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set. 
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response isn't filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `frequency` (`in`, `nin`, `ne`, `eq`)
- `method` (`in`, `nin`, `eq`, `ne`)
- `event` (`in`, `nin`, `eq`, `ne`)
- `target` (`ct`, `nct`, `eq`, `ne`)
- `status` (`eq`, `ne`)
- `approvalUserId` (`eq`, `ne`)
- `parentOrgId` (`ne`, `eq`, `nin`, `in`)
- `approvalUserEmail` (`eq`, `ne`)
- `scheduleId` (`ne`, `eq`)

List of comparison accepted - enclosed between parentheses:
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array

List of parameters accepted:
- `limitRecord` : max number of records for query (default="20", "0" or negative value for all)
- `fromRecord` : initial record in query
Example: `totalAmount(gt)=20` returns all records with a `totalAmount` that's greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">list_bills_org</a>(...) -> BillQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of bills for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.list_bills_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response isn't filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `event` (in, nin, eq, ne)
- `target` (ct, nct, eq, ne)
- `status` (eq, ne)
- `parentOrgId` (ne, eq, nin, in)
- `approvalUserId` (eq, ne)
- `approvalUserEmail` (eq, ne)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20 return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">modify_approval_bill</a>(...) -> ModifyApprovalBillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Modify the list of users the bill is sent to for approval.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.modify_approval_bill(
    id_bill=285,
    request=[
        "string"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.List[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">send_to_approval_bill</a>(...) -> BillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send a bill to a user or list of users to approve.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.send_to_approval_bill(
    id_bill=285,
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
    request=[
        "string"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**request:** `typing.List[str]` 
    
</dd>
</dl>

<dl>
<dd>

**autocreate_user:** `typing.Optional[bool]` — Automatically create the target user for approval if they don't exist.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.bill.<a href="src/seed/bill/client.py">set_approved_bill</a>(...) -> SetApprovedBillResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Approve or disapprove a bill by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.bill.set_approved_bill(
    approved="true",
    id_bill=285,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_bill:** `int` — Payabli ID for the bill. Get this ID by querying `/api/Query/bills/` for the entrypoint or the organization.
    
</dd>
</dl>

<dl>
<dd>

**approved:** `str` — String representing the approved status. Accepted values: 'true' or 'false'.
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[str]` — Email or username of user modifying approval status.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Boarding
<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">add_application</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a boarding application in an organization. This endpoint requires an application API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ApplicationDataPayIn, ApplicationDataPayInServices, ApplicationDataPayInServicesAch, ApplicationDataPayInServicesCard, Bank, ApplicationDataPayInContactsItem, ApplicationDataPayInOwnershipItem, SignerDataRequest
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.add_application(
    request=ApplicationDataPayIn(
        services=ApplicationDataPayInServices(
            ach=ApplicationDataPayInServicesAch(),
            card=ApplicationDataPayInServicesCard(
                accept_amex=True,
                accept_discover=True,
                accept_mastercard=True,
                accept_visa=True,
            ),
        ),
        annual_revenue=1000,
        average_bill_size="500",
        average_monthly_bill="5650",
        avgmonthly=1000,
        baddress="123 Walnut Street",
        baddress_1="Suite 103",
        bank_data=[
            Bank(
                account_number="123123123",
                bank_account_function=1,
                bank_account_holder_name="Gruzya Adventure Outfitters LLC",
                bank_account_holder_type="Business",
                bank_name="Test Bank",
                nickname="Withdrawal Account",
                routing_account="123123123",
                type_account="Checking",
                account_id="123-456",
            ),
            Bank(
                account_number="123123123",
                bank_account_function=0,
                bank_account_holder_name="Gruzya Adventure Outfitters LLC",
                bank_account_holder_type="Business",
                bank_name="Test Bank",
                nickname="Deposit Account",
                routing_account="123123123",
                type_account="Checking",
                account_id="123-456",
            )
        ],
        bcity="New Vegas",
        bcountry="US",
        binperson=60,
        binphone=20,
        binweb=20,
        bstate="FL",
        bsummary="Brick and mortar store that sells office supplies",
        btype="Limited Liability Company",
        bzip="33000",
        contacts=[
            ApplicationDataPayInContactsItem(
                contact_email="herman@hermanscoatings.com",
                contact_name="Herman Martinez",
                contact_phone="3055550000",
                contact_title="Owner",
            )
        ],
        credit_limit="creditLimit",
        dba_name="Sunshine Gutters",
        ein="123456789",
        faxnumber="1234567890",
        highticketamt=1000,
        legal_name="Sunshine Services, LLC",
        license="2222222FFG",
        licstate="CA",
        maddress="123 Walnut Street",
        maddress_1="STE 900",
        mcc="7777",
        mcity="Johnson City",
        mcountry="US",
        mstate="TN",
        mzip="37615",
        org_id=123,
        ownership=[
            ApplicationDataPayInOwnershipItem(
                oaddress="33 North St",
                ocity="Any City",
                ocountry="US",
                odriverstate="CA",
                ostate="CA",
                ownerdob="01/01/1990",
                ownerdriver="CA6677778",
                owneremail="test@email.com",
                ownername="John Smith",
                ownerpercent=100,
                ownerphone_1="555888111",
                ownerphone_2="555888111",
                ownerssn="123456789",
                ownertitle="CEO",
                ozip="55555",
            )
        ],
        phonenumber="1234567890",
        processing_region="US",
        recipient_email="josephray@example.com",
        recipient_email_notification=True,
        resumable=True,
        signer=SignerDataRequest(
            address="33 North St",
            address_1="STE 900",
            city="Bristol",
            country="US",
            dob="01/01/1976",
            email="test@email.com",
            name="John Smith",
            phone="555888111",
            ssn="123456789",
            state="TN",
            zip="55555",
            pci_attestation=True,
            signed_document_reference="https://example.com/signed-document.pdf",
            attestation_date="04/20/2025",
            sign_date="04/20/2025",
            additional_data={
                "deviceId": "499585-389fj484-3jcj8hj3",
                "session": "fifji4-fiu443-fn4843",
                "timeWithCompany": "6 Years"
            },
        ),
        startdate="01/01/1990",
        tax_fill_name="Sunshine LLC",
        template_id=22,
        ticketamt=1000,
        website="www.example.com",
        when_charged="When Service Provided",
        when_delivered="Over 30 Days",
        when_provided="30 Days or Less",
        when_refunded="30 Days or Less",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `AddApplicationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">delete_application</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a boarding application by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.delete_application(
    app_id=352,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**app_id:** `int` — Boarding application ID. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_application</a>(...) -> ApplicationDetailsRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the details for a boarding application by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_application(
    app_id=352,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**app_id:** `int` — Boarding application ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_application_by_auth</a>(...) -> ApplicationQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a boarding application by authentication information. This endpoint requires an `application` API token. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_application_by_auth(
    x_id="17E",
    email="admin@email.com",
    reference_id="n6UCd1f1ygG7",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**x_id:** `str` — The application ID in Hex format. Find this at the end of the boarding link URL returned in a call to api/Boarding/applink/{appId}/{mail2}. For example in:  `https://boarding-sandbox.payabli.com/boarding/externalapp/load/17E`, the xId is `17E`. 
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[Email]` — The email address the applicant used to save the application.
    
</dd>
</dl>

<dl>
<dd>

**reference_id:** `typing.Optional[str]` — The referenceId is sent to the applicant via email when they save the application.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_by_id_link_application</a>(...) -> BoardingLinkQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves details for a boarding link, by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_by_id_link_application(
    boarding_link_id=91,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**boarding_link_id:** `int` — The boarding link ID. You can find this at the end of the boarding link reference name. For example `https://boarding.payabli.com/boarding/app/myorgaccountname-00091`. The ID is `91`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_by_template_id_link_application</a>(...) -> BoardingLinkQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get details for a boarding link using the boarding template ID. This endpoint requires an application API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_by_template_id_link_application(
    template_id=80,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**template_id:** `float` — The boarding template ID. You can find this at the end of the boarding template URL in PartnerHub. Example: `https://partner-sandbox.payabli.com/myorganization/boarding/edittemplate/80`. Here, the template ID is `80`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_external_application</a>(...) -> PayabliApiResponse00</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a link and the verification code used to log into an existing boarding application. You can also use this endpoint to send a link and referenceId for an existing boarding application to an email address. The recipient can use the referenceId and email address to access and edit the application.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_external_application(
    app_id=352,
    mail_2="mail2",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**app_id:** `int` — Boarding application ID. 
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `str` — Email address used to access the application. If `sendEmail` parameter is true, a link to the application is sent to this email address.
    
</dd>
</dl>

<dl>
<dd>

**send_email:** `typing.Optional[bool]` — If `true`, sends an email that includes the link to the application to the `mail2` address. Defaults to `false`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">get_link_application</a>(...) -> BoardingLinkQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the details for a boarding link, by reference name. This endpoint requires an application API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.get_link_application(
    boarding_link_reference="myorgaccountname-00091",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**boarding_link_reference:** `str` — The boarding link reference name. You can find this at the end of the boarding link URL. For example `https://boarding.payabli.com/boarding/app/myorgaccountname-00091`
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">list_applications</a>(...) -> QueryBoardingAppsListResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of boarding applications for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.list_applications(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `createdAt` (gt, ge, lt, le, eq, ne)
- `startDate` (gt, ge, lt, le, eq, ne)
- `dbaname` (ct, nct)
- `legalname` (ct, nct)
- `ein` (ct, nct)
- `address` (ct, nct)
- `city` (ct, nct)
- `state` (ct, nct)
- `phone` (ct, nct)
- `mcc` (ct, nct)
- `owntype` (ct, nct)
- `ownerName` (ct, nct)
- `contactName` (ct, nct)
- `status` (in, nin, eq,ne)
- `orgParentname` (ct, nct)
- `externalpaypointID` (ct, nct, eq, ne)
- `repCode` (ct, nct, eq, ne)
- `repName` (ct, nct, eq, ne)
- `repOffice` (ct, nct, eq, ne)
List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">list_boarding_links</a>(...) -> QueryBoardingLinksResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Return a list of boarding links for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.list_boarding_links(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `lastUpdated` (gt, ge, lt, le, eq, ne)
- `templateName` (ct, nct)
- `referenceName` (ct, nct)
- `acceptRegister` (eq, ne)
- `acceptAuth` (eq, ne)
- `templateCode` (ct, nct)
- `templateId` (eq, ne)
- `orgParentname` (ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than 
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: templateName(ct)=hoa return all records with template title containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.boarding.<a href="src/seed/boarding/client.py">update_application</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a boarding application by ID. This endpoint requires an application API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.boarding.update_application(
    app_id=352,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**app_id:** `int` — Boarding application ID. 
    
</dd>
</dl>

<dl>
<dd>

**request:** `ApplicationData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## ChargeBacks
<details><summary><code>client.charge_backs.<a href="src/seed/charge_backs/client.py">add_response</a>(...) -> AddResponseResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a response to a chargeback or ACH return.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.charge_backs.add_response(
    id=1000000,
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — ID of the chargeback or return record.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**attachments:** `typing.Optional[Attachments]` — Array of attached files to response.
    
</dd>
</dl>

<dl>
<dd>

**contact_email:** `typing.Optional[Email]` — Email of response submitter.
    
</dd>
</dl>

<dl>
<dd>

**contact_name:** `typing.Optional[str]` — Name of response submitter
    
</dd>
</dl>

<dl>
<dd>

**notes:** `typing.Optional[str]` — Response notes
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.charge_backs.<a href="src/seed/charge_backs/client.py">get_chargeback</a>(...) -> ChargebackQueryRecords</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a chargeback record and its details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.charge_backs.get_chargeback(
    id=1000000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — ID of the chargeback or return record. This is returned as `chargebackId` in the [RecievedChargeback](/developers/developer-guides/webhook-payloads#receivedChargeback) and [ReceivedAchReturn](/developers/developer-guides/webhook-payloads#receivedachreturn) webhook notifications.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.charge_backs.<a href="src/seed/charge_backs/client.py">get_chargeback_attachment</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a chargeback attachment file by its file name.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.charge_backs.get_chargeback_attachment(
    id=1000000,
    file_name="fileName",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — The ID of chargeback or return record.
    
</dd>
</dl>

<dl>
<dd>

**file_name:** `str` — The chargeback attachment's file name.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## CheckCapture
<details><summary><code>client.check_capture.<a href="src/seed/check_capture/client.py">check_processing</a>(...) -> CheckCaptureResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Captures a check for Remote Deposit Capture (RDC) using the provided check images and details. This endpoint handles the OCR extraction of check data including MICR, routing number, account number, and amount. See the [RDC guide](/developers/developer-guides/pay-in-rdc) for more details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.check_capture.check_processing(
    entry_point="47abcfea12",
    front_image="/9j/4AAQSkZJRgABAQEASABIAAD...",
    rear_image="/9j/4AAQSkZJRgABAQEASABIAAD...",
    check_amount=12550,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry_point:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**front_image:** `str` — Base64-encoded front check image. Must be JPEG or PNG format and less than 1MB. Image must show the entire check clearly with no partial, blurry, or illegible portions.
    
</dd>
</dl>

<dl>
<dd>

**rear_image:** `str` — Base64-encoded rear check image. Must be JPEG or PNG format and less than 1MB. Image must show the entire check clearly with no partial, blurry, or illegible portions.
    
</dd>
</dl>

<dl>
<dd>

**check_amount:** `int` — Check amount in cents (maximum 32-bit integer value).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Cloud
<details><summary><code>client.cloud.<a href="src/seed/cloud/client.py">add_device</a>(...) -> AddDeviceResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Register a cloud device to an entrypoint. See [Devices Quickstart](/developers/developer-guides/devices-quickstart#devices-quickstart) for a complete guide.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.cloud.add_device(
    entry="8cfec329267",
    registration_code="YS7DS5",
    description="Front Desk POS",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**description:** `typing.Optional[str]` — Description or name for the device. This can be anything, but Payabli recommends entering the name of the paypoint, or some other easy to identify descriptor. If you have several devices for one paypoint, you can give them descriptions like "Cashier 1" and "Cashier 2", or "Front Desk" and "Back Office"
    
</dd>
</dl>

<dl>
<dd>

**registration_code:** `typing.Optional[str]` 

The device registration code or serial number, depending on the model.

- Ingenico devices: This is the activation code that's displayed on the device screen during setup.

- PAX A920 device: This code is the serial number on the back of the device.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.cloud.<a href="src/seed/cloud/client.py">history_device</a>(...) -> CloudQueryApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve the registration history for a device. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.cloud.history_device(
    device_id="WXGDWB",
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**device_id:** `str` — ID of the cloud device. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.cloud.<a href="src/seed/cloud/client.py">list_device</a>(...) -> CloudQueryApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a list of cloud devices registered to an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.cloud.list_device(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**force_refresh:** `typing.Optional[bool]` — When `true`, the request retrieves an updated list of devices from the processor instead of returning a cached list of devices.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.cloud.<a href="src/seed/cloud/client.py">remove_device</a>(...) -> RemoveDeviceResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Remove a cloud device from an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.cloud.remove_device(
    device_id="6c361c7d-674c-44cc-b790-382b75d1xxx",
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**device_id:** `str` — ID of the cloud device. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Customer
<details><summary><code>client.customer.<a href="src/seed/customer/client.py">add_customer</a>(...) -> PayabliApiResponseCustomerQuery</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a customer in an entrypoint. An identifier is required to create customer records. Change your identifier settings in Settings > Custom Fields in PartnerHub. 
If you don't include an identifier, the record is rejected.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.add_customer(
    entry="8cfec329267",
    customer_number="12356ACB",
    firstname="Irene",
    lastname="Canizales",
    address_1="123 Bishop\'s Trail",
    city="Mountain City",
    state="TN",
    zip="37612",
    country="US",
    email="irene@canizalesconcrete.com",
    identifier_fields=[
        "email"
    ],
    time_zone=-5,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entrypointfield` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CustomerData` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[bool]` — When `true`, the request creates a new customer record, regardless of whether customer identifiers match an existing customer.
    
</dd>
</dl>

<dl>
<dd>

**replace_existing:** `typing.Optional[int]` — Flag indicating to replace existing customer with a new record. Possible values: 0 (don't replace), 1 (replace). Default is `0`.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customer.<a href="src/seed/customer/client.py">delete_customer</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a customer record.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.delete_customer(
    customer_id=998,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customer.<a href="src/seed/customer/client.py">get_customer</a>(...) -> CustomerQueryRecords</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a customer's record and details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.get_customer(
    customer_id=998,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customer.<a href="src/seed/customer/client.py">link_customer_transaction</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Links a customer to a transaction by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.link_customer_transaction(
    customer_id=998,
    trans_id="45-as456777hhhhhhhhhh77777777-324",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customer.<a href="src/seed/customer/client.py">request_consent</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Sends the consent opt-in email to the customer email address in the customer record.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.request_consent(
    customer_id=998,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.customer.<a href="src/seed/customer/client.py">update_customer</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a customer record. Include only the fields you want to change.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.customer.update_customer(
    customer_id=998,
    firstname="Irene",
    lastname="Canizales",
    address_1="145 Bishop\'s Trail",
    city="Mountain City",
    state="TN",
    zip="37612",
    country="US",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**request:** `CustomerData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Export
<details><summary><code>client.export.<a href="src/seed/export/client.py">export_applications</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of boarding applications for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_applications(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `createdAt` (gt, ge, lt, le, eq, ne)
- `startDate` (gt, ge, lt, le, eq, ne)
- `dbaname`  (ct, nct)
- `legalname`  (ct, nct)
- `ein`  (ct, nct)
- `address`  (ct, nct)
- `city`  (ct, nct)
- `state`  (ct, nct)
- `phone`  (ct, nct)
- `mcc`  (ct, nct)
- `owntype`  (ct, nct)
- `ownerName`  (ct, nct)
- `contactName`  (ct, nct)
- `status`  (eq, ne)
- `orgParentname`  (ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- `limitRecord` : max number of records for query (default="20", "0" or negative value for all)
- `fromRecord` : initial record in query

Example: `dbaname(ct)=hoa` returns all records with a `dbaname` containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batch_details</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint is deprecated. Export batch details for a paypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batch_details(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**

  - `settlementDate` (gt, ge, lt, le, eq, ne)
  - `depositDate` (gt, ge, lt, le, eq, ne)
  - `transId`  (ne, eq, ct, nct)
  - `gatewayTransId`  (ne, eq, ct, nct)
  - `method`   (in, nin, eq, ne)
  - `settledAmount`  (gt, ge, lt, le, eq, ne)
  - `operation`    (in, nin, eq, ne)
  - `source`   (in, nin, eq, ne)
  - `batchNumber`  (ct, nct, eq, ne)
  - `payaccountLastfour`   (nct, ct)
  - `payaccountType`   (ne, eq, in, nin)
  - `customerFirstname`   (ct, nct, eq, ne)
  - `customerLastname`    (ct, nct, eq, ne)
  - `customerName`   (ct, nct)
  - `customerId`  (eq, ne)
  - `customerNumber`  (ct, nct, eq, ne)
  - `customerCompanyname`    (ct, nct, eq, ne)
  - `customerAddress` (ct, nct, eq, ne)
  - `customerCity`    (ct, nct, eq, ne)
  - `customerZip` (ct, nct, eq, ne)
  - `customerState` (ct, nct, eq, ne)
  - `customerCountry` (ct, nct, eq, ne)
  - `customerPhone` (ct, nct, eq, ne)
  - `customerEmail` (ct, nct, eq, ne)
  - `customerShippingAddress` (ct, nct, eq, ne)
  - `customerShippingCity`    (ct, nct, eq, ne)
  - `customerShippingZip` (ct, nct, eq, ne)
  - `customerShippingState` (ct, nct, eq, ne)
  - `customerShippingCountry` (ct, nct, eq, ne)
  - `orgId`  (eq) *mandatory when entry=org*
  - `isHold` (eq, ne)
  - `paypointId`  (ne, eq)
  - `paypointLegal`  (ne, eq, ct, nct)
  - `paypointDba`  (ne, eq, ct, nct)
  - `orgName`  (ne, eq, ct, nct)
  - `batchId` (ct, nct, eq, neq)
  - `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `amount(gt)=20` return all records with amount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batch_details_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint is deprecated. Export batch details for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batch_details_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**

  - `settlementDate` (gt, ge, lt, le, eq, ne)
  - `depositDate` (gt, ge, lt, le, eq, ne)
  - `transId`  (ne, eq, ct, nct)
  - `gatewayTransId`  (ne, eq, ct, nct)
  - `method`   (in, nin, eq, ne)
  - `settledAmount`  (gt, ge, lt, le, eq, ne)
  - `operation`    (in, nin, eq, ne)
  - `source`   (in, nin, eq, ne)
  - `batchNumber`  (ct, nct, eq, ne)
  - `payaccountLastfour`   (nct, ct)
  - `payaccountType`   (ne, eq, in, nin)
  - `customerFirstname`   (ct, nct, eq, ne)
  - `customerLastname`    (ct, nct, eq, ne)
  - `customerName`   (ct, nct)
  - `customerId`  (eq, ne)
  - `customerNumber`  (ct, nct, eq, ne)
  - `customerCompanyname`    (ct, nct, eq, ne)
  - `customerAddress` (ct, nct, eq, ne)
  - `customerCity`    (ct, nct, eq, ne)
  - `customerZip` (ct, nct, eq, ne)
  - `customerState` (ct, nct, eq, ne)
  - `customerCountry` (ct, nct, eq, ne)
  - `customerPhone` (ct, nct, eq, ne)
  - `customerEmail` (ct, nct, eq, ne)
  - `customerShippingAddress` (ct, nct, eq, ne)
  - `customerShippingCity`    (ct, nct, eq, ne)
  - `customerShippingZip` (ct, nct, eq, ne)
  - `customerShippingState` (ct, nct, eq, ne)
  - `customerShippingCountry` (ct, nct, eq, ne)
  - `orgId`  (eq) *mandatory when entry=org*
  - `isHold` (eq, ne)
  - `paypointId`  (ne, eq)
  - `paypointLegal`  (ne, eq, ct, nct)
  - `paypointDba`  (ne, eq, ct, nct)
  - `orgName`  (ne, eq, ct, nct)
  - `batchId` (ct, nct, eq, neq)
  - `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `amount(gt)=20` return all records with amount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batches</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of batches for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batches(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `connectorName` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `feeBatchAmount` (gt, ge, lt, le, eq, ne)
- `netBatchAmount` (gt, ge, lt, le, eq, ne)
- `releaseAmount` (gt, ge, lt, le, eq, ne)
- `heldAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
- `expectedDepositDate` (gt, ge, lt, le, eq, ne)
- `batchRecords` (gt, ge, lt, le, eq, ne)
- `transferId` (ne, eq)
- `transferDate` (gt, ge, lt, le, eq, ne)
- `grossAmount` (gt, ge, lt, le, eq, ne)
- `chargeBackAmount` (gt, ge, lt, le, eq, ne)
- `returnedAmount` (gt, ge, lt, le, eq, ne)
- `billingFeeAmount` (gt, ge, lt, le, eq, ne)
- `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
- `netFundedAmount` (gt, ge, lt, le, eq, ne)
- `adjustmentAmount` (gt, ge, lt, le, eq, ne)
- `processor` (ne, eq, ct, nct)
- `transferStatus` (ne, eq, in, nin)

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batches_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of batches for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batches_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `connectorName` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `feeBatchAmount` (gt, ge, lt, le, eq, ne)
- `netBatchAmount` (gt, ge, lt, le, eq, ne)
- `releaseAmount` (gt, ge, lt, le, eq, ne)
- `heldAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
- `expectedDepositDate` (gt, ge, lt, le, eq, ne)
- `batchRecords` (gt, ge, lt, le, eq, ne)
- `transferId` (ne, eq)
- `transferDate` (gt, ge, lt, le, eq, ne)
- `grossAmount` (gt, ge, lt, le, eq, ne)
- `chargeBackAmount` (gt, ge, lt, le, eq, ne)
- `returnedAmount` (gt, ge, lt, le, eq, ne)
- `billingFeeAmount` (gt, ge, lt, le, eq, ne)
- `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
- `netFundedAmount` (gt, ge, lt, le, eq, ne)
- `adjustmentAmount` (gt, ge, lt, le, eq, ne)
- `processor` (ne, eq, ct, nct)
- `transferStatus` (ne, eq, in, nin)

List of parameters accepted:
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query
Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batches_out</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of money out batches for a paypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batches_out(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
  - `batchDate` (gt, ge, lt, le, eq, ne)
  - `batchNumber` (ne, eq)
  - `batchAmount` (gt, ge, lt, le, eq, ne)
  - `status` (in, nin, eq, ne)
  - `paypointLegal` (ne, eq, ct, nct)
  - `paypointDba` (ne, eq, ct, nct)
  - `orgName` (ne, eq, ct, nct, nin, in)
  - `paypointId` (ne, eq)
  - `externalPaypointID` (ct, nct, eq, ne)
List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00"
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_batches_out_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of money out batches for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_batches_out_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
  - `batchDate` (gt, ge, lt, le, eq, ne)
  - `batchNumber` (ne, eq)
  - `batchAmount` (gt, ge, lt, le, eq, ne)
  - `status` (in, nin, eq, ne)
  - `paypointLegal` (ne, eq, ct, nct)
  - `paypointDba` (ne, eq, ct, nct)
  - `orgName` (ne, eq, ct, nct, nin, in)
  - `paypointId` (ne, eq)
  - `externalPaypointID` (ct, nct, eq, ne)
List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00"
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_bills</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of bills for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_bills(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `status` (in, nin, eq, ne)
- `billNumber` (ct, nct, eq, ne)
- `billDate` (gt, ge, lt, le, eq, ne)
- `billDueDate` (gt, ge, lt, le, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `vendorName` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `paymentMethod` (ct, nct, eq, ne)
- `paymentId` (ct, nct, eq, ne)
- `paymentgroup` (ct, nct, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20  return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_bills_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of bills for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_bills_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `status` (in, nin, eq, ne)
- `billNumber` (ct, nct, eq, ne)
- `billDate` (gt, ge, lt, le, eq, ne)
- `billDueDate` (gt, ge, lt, le, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `vendorName` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `paymentMethod` (ct, nct, eq, ne)
- `paymentId` (ct, nct, eq, ne)
- `paymentgroup` (ct, nct, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20  return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_chargebacks</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of chargebacks and ACH returns for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_chargebacks(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `chargebackDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `reasonCode` (in, nin, eq, ne)
- `reason` (ct, nct, eq, ne)
- `caseNumber` (ct, nct, eq, ne)
- `status` (in, nin, eq, ne)
- `accountType` (in, nin, eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_chargebacks_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of chargebacks and ACH returns for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_chargebacks_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `chargebackDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `reasonCode` (in, nin, eq, ne)
- `reason` (ct, nct, eq, ne)
- `caseNumber` (ct, nct, eq, ne)
- `status` (in, nin, eq, ne)
- `accountType` (in, nin, eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_customers</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of customers for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_customers(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**
- `createdDate` (gt, ge, lt, le, eq, ne)
- `customernumber` (ne, eq, ct, nct)
- `firstname` (ne, eq, ct, nct)
- `lastname` (ne, eq, ct, nct)
- `name` (ct, nct)
- `address` (ne, eq, ct, nct)
- `city` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `shippingaddress` (ne, eq, ct, nct)
- `shippingcity` (ne, eq, ct, nct)
- `shippingcountry` (ne, eq, ct, nct)
- `shippingzip` (ne, eq, ct, nct)
- `shippingstate` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `company` (ne, eq, ct, nct)
- `username` (ne, eq, ct, nct)
- `balance` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

**List of comparison accepted - enclosed between parentheses:**
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

**List of parameters accepted:**
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

**Example:**
balance(gt)=20 return all records with balance greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_customers_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Exports a list of customers for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_customers_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**
- `createdDate` (gt, ge, lt, le, eq, ne)
- `customernumber` (ne, eq, ct, nct)
- `firstname` (ne, eq, ct, nct)
- `lastname` (ne, eq, ct, nct)
- `name` (ct, nct)
- `address` (ne, eq, ct, nct)
- `city` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `shippingaddress` (ne, eq, ct, nct)
- `shippingcity` (ne, eq, ct, nct)
- `shippingcountry` (ne, eq, ct, nct)
- `shippingzip` (ne, eq, ct, nct)
- `shippingstate` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `company` (ne, eq, ct, nct)
- `username` (ne, eq, ct, nct)
- `balance` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

**List of comparison accepted - enclosed between parentheses:**
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

**List of parameters accepted:**
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

**Example:**
balance(gt)=20 return all records with balance greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_invoices</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export list of invoices for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_invoices(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
 - `invoiceDate` (gt, ge, lt, le, eq, ne)
 - `dueDate` (gt, ge, lt, le, eq, ne)
 - `sentDate` (gt, ge, lt, le, eq, ne)
 - `frequency`  (in, nin,ne, eq)
 - `invoiceType`   (eq, ne)
 - `payTerms`   (in, nin, eq, ne)
 - `paypointId`  (ne, eq)
 - `totalAmount`  (gt, ge, lt, le, eq, ne)
 - `paidAmount`  (gt, ge, lt, le, eq, ne)
 - `status`   (in, nin, eq, ne)
 - `invoiceNumber`   (ct, nct, eq, ne)
 - `purchaseOrder`   (ct, nct, eq, ne)
 - `itemProductCode` (ct, nct)
 - `itemDescription` (ct, nct)
 - `customerFirstname`   (ct, nct, eq, ne)
 - `customerLastname`    (ct, nct, eq, ne)
 - `customerName`   (ct, nct)
 - `customerId`  (eq, ne)
 - `customerNumber`  (ct, nct, eq, ne)
 - `customerCompanyname`    (ct, nct, eq, ne)
 - `customerAddress` (ct, nct, eq, ne)
 - `customerCity`    (ct, nct, eq, ne)
 - `customerZip` (ct, nct, eq, ne)
 - `customerState` (ct, nct, eq, ne)
 - `customerCountry` (ct, nct, eq, ne)
 - `customerPhone` (ct, nct, eq, ne)
 - `customerEmail` (ct, nct, eq, ne)
 - `customerShippingAddress` (ct, nct, eq, ne)
 - `customerShippingCity` (ct, nct, eq, ne)
 - `customerShippingZip` (ct, nct, eq, ne)
 - `customerShippingState` (ct, nct, eq, ne)
 - `customerShippingCountry` (ct, nct, eq, ne)
 - `orgId`  (eq) 
 - `paylinkId`  (ne, eq)
 - `paypointLegal`  (ne, eq, ct, nct)
 - `paypointDba`  (ne, eq, ct, nct)
 - `orgName`  (ne, eq, ct, nct)
 - `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
 - eq or empty => equal
 - gt => greater than
 - ge => greater or equal
 - lt => less than
 - le => less or equal
 - ne => not equal
 - ct => contains
 - nct => not contains
 - in => inside array
 - nin => not inside array
 
List of parameters accepted:
 - `limitRecord` : max number of records for query (default="20", "0" or negative value for all)
 - `fromRecord` : initial record in query
 
Example: `totalAmount(gt)=20` returns all records with `totalAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_invoices_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of invoices for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_invoices_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
 - `invoiceDate` (gt, ge, lt, le, eq, ne)
 - `dueDate` (gt, ge, lt, le, eq, ne)
 - `sentDate` (gt, ge, lt, le, eq, ne)
 - `frequency` (in, nin,ne, eq)
 - `invoiceType` (eq, ne)
 - `payTerms` (in, nin, eq, ne)
 - `paypointId` (ne, eq)
 - `totalAmount` (gt, ge, lt, le, eq, ne)
 - `paidAmount` (gt, ge, lt, le, eq, ne)
 - `status` (in, nin, eq, ne)
 - `invoiceNumber` (ct, nct, eq, ne)
 - `purchaseOrder` (ct, nct, eq, ne)
 - `itemProductCode` (ct, nct)
 - `itemDescription` (ct, nct)
 - `customerFirstname` (ct, nct, eq, ne)
 - `customerLastname` (ct, nct, eq, ne)
 - `customerName` (ct, nct)
 - `customerId` (eq, ne)
 - `customerNumber` (ct, nct, eq, ne)
 - `customerCompanyname` (ct, nct, eq, ne)
 - `customerAddress` (ct, nct, eq, ne)
 - `customerCity` (ct, nct, eq, ne)
 - `customerZip` (ct, nct, eq, ne)
 - `customerState` (ct, nct, eq, ne)
 - `customerCountry` (ct, nct, eq, ne)
 - `customerPhone` (ct, nct, eq, ne)
 - `customerEmail` (ct, nct, eq, ne)
 - `customerShippingAddress` (ct, nct, eq, ne)
 - `customerShippingCity` (ct, nct, eq, ne)
 - `customerShippingZip` (ct, nct, eq, ne)
 - `customerShippingState` (ct, nct, eq, ne)
 - `customerShippingCountry` (ct, nct, eq, ne)
 - `orgId` (eq) 
 - `paylinkId` (ne, eq)
 - `paypointLegal` (ne, eq, ct, nct)
 - `paypointDba` (ne, eq, ct, nct)
 - `orgName` (ne, eq, ct, nct)
 - `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name
 
List of comparison accepted - enclosed between parentheses:
 - eq or empty => equal
 - gt => greater than
 - ge => greater or equal
 - lt => less than
 - le => less or equal
 - ne => not equal
 - ct => contains
 - nct => not contains
 - in => inside array
 - nin => not inside array
 
List of parameters accepted:
 - limitRecord : max number of records for query (default="20", "0" or negative value for all)
 - fromRecord : initial record in query
 
Example: totalAmount(gt)=20  return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_organizations</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of child organizations (suborganizations) for a parent organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_organizations(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `name` (ct, nct, eq, ne)
- `type` (ne, eq)
- `contactName` (ct, nct, eq, ne)
- `contactTitle` (ct, nct, eq, ne)
- `contactEmail` (ct, nct, eq, ne)
- `contactPhone` (ct, nct, eq, ne)
- `city` (ct, nct, eq, ne)
- `state` (in, nin, eq, ne)
- `address` (ct, nct, eq, ne)
- `country` (ct, nct, eq, ne)
- `zip` (ct, nct, eq, ne)
- `hasBilling` any value greater than zero is taken as TRUE otherwise is FALSE
- `hasResidual` any value greater than zero is taken as TRUE otherwise is FALSE

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: name(ct)=hoa  return all records where name contains "hoa"
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_payout</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of payouts and their statuses for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_payout(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `status` (in, nin, eq, ne)
- `transactionDate` (gt, ge, lt, le, eq, ne)
- `billNumber` (ct, nct)
- `vendorNumber` (ct, nct, eq, ne)
- `vendorName` (ct, nct, eq, ne)
- `paymentMethod` (ct, nct, eq, ne)
- `paymentId` (ct, nct, eq, ne)
- `paymentgroup` (ct, nct, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: totalAmount(gt)=20 return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_payout_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of payouts and their details for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_payout_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `status` (in, nin, eq, ne)
- `transactionDate` (gt, ge, lt, le, eq, ne)
- `billNumber` (ct, nct)
- `vendorNumber` (ct, nct, eq, ne)
- `vendorName` (ct, nct, eq, ne)
- `paymentMethod` (ct, nct, eq, ne)
- `paymentId` (ct, nct, eq, ne)
- `paymentgroup` (ct, nct, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: totalAmount(gt)=20 return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_paypoints</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of paypoints in an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_paypoints(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `createdAt` (gt, ge, lt, le, eq, ne)
- `startDate` (gt, ge, lt, le, eq, ne)
- `dbaname` (ct, nct)
- `legalname` (ct, nct)
- `ein` (ct, nct)
- `address` (ct, nct)
- `city` (ct, nct)
- `state` (ct, nct)
- `phone` (ct, nct)
- `mcc` (ct, nct)
- `owntype` (ct, nct)
- `ownerName` (ct, nct)
- `contactName` (ct, nct)
- `orgParentname` (ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `dbaname(ct)=hoa` returns all records with `dbaname` containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_settlements</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of settled transactions for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_settlements(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `settlementDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `gatewayTransId` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `settledAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne)
- `batchNumber` (ct, nct, eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_settlements_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of settled transactions for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_settlements_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `settlementDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `gatewayTransId` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `settledAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne)
- `batchNumber` (ct, nct, eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord: max number of records for query (default="20", "0" or negative value for all)
- fromRecord: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_subscriptions</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of subscriptions for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_subscriptions(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) 
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_subscriptions_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of subscriptions for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_subscriptions_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq) 
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_transactions</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of transactions for an entrypoint in a file in XLXS or CSV format. Use filters to limit results. If you don't specify a date range in the request, the last two months of data are returned.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_transactions(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `transactionDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `gatewayTransId` (ne, eq, ct, nct)
- `orderId` (ne, eq)
- `idTrans` (ne, eq)
- `orgId` (ne, eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne)
- `status` (in, nin, eq, ne)
- `settlementStatus` (in, nin, eq, ne)
- `batchNumber` (nct, ct)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_transactions_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of transactions for an org in a file in XLSX or CSV format. Use filters to limit results. If you don't specify a date range in the request, the last two months of data are returned.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_transactions_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
- `transactionDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct)
- `gatewayTransId` (ne, eq, ct, nct)
- `orderId` (ne, eq)
- `idTrans` (ne, eq)
- `orgId` (ne, eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne)
- `status` (in, nin, eq, ne)
- `settlementStatus` (in, nin, eq, ne)
- `batchNumber` (nct, ct)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_transfer_details</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of transfer details for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_transfer_details(
    entry="8cfec329267",
    format="csv",
    transfer_id=1000000,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**transfer_id:** `int` — Transfer identifier.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:

  - `grossAmount` (gt, ge, lt, le, eq, ne)

  - `chargeBackAmount` (gt, ge, lt, le, eq, ne)

  - `returnedAmount` (gt, ge, lt, le, eq, ne)

  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)

  - `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)

  - `netFundedAmount` (gt, ge, lt, le, eq, ne)

  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)

  - `transactionId` (eq, ne, in, nin)

  - `category` (eq, ne, ct, nct)

  - `type` (eq, ne, in, nin)

  - `method` (eq, ne, in, nin)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_transfers</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a list of transfers for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_transfers(
    entry="8cfec329267",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help. 

List of field names accepted:
  - `transferDate` (gt, ge, lt, le, eq, ne)

  - `grossAmount` (gt, ge, lt, le, eq, ne)

  - `chargeBackAmount` (gt, ge, lt, le, eq, ne)

  - `returnedAmount` (gt, ge, lt, le, eq, ne)

  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)

  - `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)

  - `netFundedAmount` (gt, ge, lt, le, eq, ne)

  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)

  - `processor` (ne, eq, ct, nct)

  - `transferStatus` (ne, eq, in, nin)

  - `batchNumber` (ne, eq, ct, nct)

  - `batchId` (ne, eq, in, nin)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_vendors</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of vendors for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_vendors(
    entry="8cfec329267",
    format="csv",
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `method` (in, nin, eq, ne)
- `enrollmentStatus` (in, nin, eq, ne)
- `status` (in, nin, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `name` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `phone` (ct, nct, eq, ne)
- `email` (ct, nct, eq, ne)
- `address` (ct, nct, eq, ne)
- `city` (ct, nct, eq, ne)
- `state` (ct, nct, eq, ne)
- `country` (ct, nct, eq, ne)
- `zip` (ct, nct, eq, ne)
- `mcc` (ct, nct, eq, ne)
- `locationCode` (ct, nct, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.export.<a href="src/seed/export/client.py">export_vendors_org</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a list of vendors for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.export.export_vendors_org(
    format="csv",
    org_id=123,
    columns_export="BatchDate:Batch_Date,PaypointName:Legal_name",
    from_record=251,
    limit_record=1000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**format:** `ExportFormat1` — Format for the export, either XLSX or CSV. 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**columns_export:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — The number of records to return for the query. The maximum is 30,000 records. When this parameter isn't sent, the API returns up to 25,000 records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `method` (in, nin, eq, ne)
- `enrollmentStatus` (in, nin, eq, ne)
- `status` (in, nin, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `name` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `phone` (ct, nct, eq, ne)
- `email` (ct, nct, eq, ne)
- `address` (ct, nct, eq, ne)
- `city` (ct, nct, eq, ne)
- `state` (ct, nct, eq, ne)
- `country` (ct, nct, eq, ne)
- `zip` (ct, nct, eq, ne)
- `mcc` (ct, nct, eq, ne)
- `locationCode` (ct, nct, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## GhostCard
<details><summary><code>client.ghost_card.<a href="src/seed/ghost_card/client.py">create_ghost_card</a>(...) -> CreateGhostCardResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a ghost card, a multi-use virtual debit card issued to a vendor for recurring or discretionary spend.

Unlike single-use virtual cards issued as part of a payout transaction, ghost cards aren't tied to a specific payout. They're issued directly to a vendor and can be reused up to a configurable number of times within the card's spending limits.

Only one ghost card can exist per vendor per paypoint. To issue a new card to the same vendor, cancel the existing card first.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.ghost_card.create_ghost_card(
    entry="8cfec2e0fa",
    vendor_id=42,
    expense_limit=500,
    amount=500,
    max_number_of_uses=3,
    exact_amount=False,
    expense_limit_period="monthly",
    billing_cycle="monthly",
    billing_cycle_day="1",
    daily_transaction_count=5,
    daily_amount_limit=200,
    transaction_amount_limit=100,
    mcc="5411",
    tcc="R",
    misc_1="PO-98765",
    misc_2="Dept-Finance",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**vendor_id:** `int` — ID of the vendor who receives the card. The vendor must belong to the paypoint and have an active status.
    
</dd>
</dl>

<dl>
<dd>

**expense_limit:** `float` — Spending limit for the card. Must be greater than `0` and can't exceed the paypoint's configured payout credit limit.
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` — Initial load amount for the card.
    
</dd>
</dl>

<dl>
<dd>

**max_number_of_uses:** `int` — Maximum number of times the card can be used. Ignored and set to `1` when `exactAmount` is `true`.
    
</dd>
</dl>

<dl>
<dd>

**exact_amount:** `bool` — When `true`, restricts the card to a single use. `maxNumberOfUses` is automatically set to `1` regardless of any other value provided.
    
</dd>
</dl>

<dl>
<dd>

**expense_limit_period:** `str` — Time period over which `expenseLimit` applies (for example, `monthly` or `weekly`).
    
</dd>
</dl>

<dl>
<dd>

**billing_cycle:** `str` — Billing cycle identifier.
    
</dd>
</dl>

<dl>
<dd>

**billing_cycle_day:** `str` — Day within the billing cycle.
    
</dd>
</dl>

<dl>
<dd>

**daily_transaction_count:** `int` — Maximum number of transactions allowed per day.
    
</dd>
</dl>

<dl>
<dd>

**daily_amount_limit:** `float` — Maximum total spend allowed per day.
    
</dd>
</dl>

<dl>
<dd>

**transaction_amount_limit:** `int` — Maximum spend allowed per single transaction.
    
</dd>
</dl>

<dl>
<dd>

**expiration_date:** `typing.Optional[str]` — Requested expiration date for the card. If not provided, defaults to 30 days from creation.
    
</dd>
</dl>

<dl>
<dd>

**mcc:** `typing.Optional[str]` — Merchant Category Code to restrict where the card can be used. Must be a valid MCC if provided.
    
</dd>
</dl>

<dl>
<dd>

**tcc:** `typing.Optional[str]` — Transaction Category Code to restrict where the card can be used. Must be a valid TCC if provided.
    
</dd>
</dl>

<dl>
<dd>

**misc_1:** `typing.Optional[str]` — Custom metadata field. Stored on the card record.
    
</dd>
</dl>

<dl>
<dd>

**misc_2:** `typing.Optional[str]` — Custom metadata field. Stored on the card record.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.ghost_card.<a href="src/seed/ghost_card/client.py">update_card</a>(...) -> PayabliApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates the status of a virtual card (including ghost cards) under a paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.ghost_card.update_card(
    entry="8cfec2e0fa",
    card_token="gc_abc123def456",
    status="Cancelled",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**card_token:** `str` — Token that uniquely identifies the card. This is the `ReferenceId` returned when the card was created.
    
</dd>
</dl>

<dl>
<dd>

**status:** `typing.Optional[CardStatus]` — The new status to set on the card.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## HostedPaymentPages
<details><summary><code>client.hosted_payment_pages.<a href="src/seed/hosted_payment_pages/client.py">load_page</a>(...) -> PayabliPages</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Loads all of a payment page's details including `pageIdentifier` and `validationCode`. This endpoint requires an `application` API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.hosted_payment_pages.load_page(
    entry="8cfec329267",
    subdomain="pay-your-fees-1",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**subdomain:** `str` — Payment page identifier. The subdomain value is the last part of the payment page URL. For example, in`https://paypages-sandbox.payabli.com/513823dc10/pay-your-fees-1`, the subdomain is `pay-your-fees-1`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.hosted_payment_pages.<a href="src/seed/hosted_payment_pages/client.py">new_page</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>


Creates a new payment page for a paypoint. 
Note: this operation doesn't create a new paypoint, just a payment page for an existing paypoint. Paypoints are created by the Payabli team when a boarding application is approved.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.hosted_payment_pages.new_page(
    entry="8cfec329267",
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request:** `PayabliPages` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.hosted_payment_pages.<a href="src/seed/hosted_payment_pages/client.py">save_page</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a payment page in a paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.hosted_payment_pages.save_page(
    entry="8cfec329267",
    subdomain_="pay-your-fees-1",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**subdomain:** `str` — Payment page identifier. The subdomain value is the last part of the payment page URL. For example, in`https://paypages-sandbox.payabli.com/513823dc10/pay-your-fees-1`, the subdomain is `pay-your-fees-1`.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PayabliPages` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Import
<details><summary><code>client.import_.<a href="src/seed/import_/client.py">import_bills</a>(...) -> PayabliApiResponseImport</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Import a list of bills from a CSV file. See the [Import Guide](/developers/developer-guides/bills-add#import-bills) for more help and an example file.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.import_.import_bills(
    entry="8cfec329267",
    file="example_file",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` — The file to be imported. The file must be a CSV file with the correct format. See the [Import Guide](/developers/developer-guides/bills-add#import-bills) for more help and example files.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.import_.<a href="src/seed/import_/client.py">import_customer</a>(...) -> PayabliApiResponseImport</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Import a list of customers from a CSV file. See the [Import Guide](/developers/developer-guides/entities-customers#import-customers) for more help and example files.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.import_.import_customer(
    entry="8cfec329267",
    file="example_file",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entrypointfield` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**replace_existing:** `typing.Optional[int]` — Flag indicating to replace existing customer with a new record. Possible values: 0 (do not replace), 1 (replace). Default is 0
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.import_.<a href="src/seed/import_/client.py">import_vendor</a>(...) -> PayabliApiResponseImport</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Import a list of vendors from a CSV file. See the [Import Guide](/developers/developer-guides/entities-vendors#import-vendors) for more help and example files.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.import_.import_vendor(
    entry="8cfec329267",
    file="example_file",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entrypointfield` 
    
</dd>
</dl>

<dl>
<dd>

**file:** `core.File` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Invoice
<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">add_invoice</a>(...) -> InvoiceResponseWithoutData</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates an invoice in an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, BillData, BillItem
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.add_invoice(
    entry="8cfec329267",
    customer_data=PayorDataRequest(
        first_name="Tamara",
        last_name="Bagratoni",
        customer_number="3",
    ),
    invoice_data=BillData(
        items=[
            BillItem(
                item_product_name="Adventure Consult",
                item_description="Consultation for Georgian tours",
                item_cost=100,
                item_qty=1,
                item_mode=1,
                item_total_amount=1,
            ),
            BillItem(
                item_product_name="Deposit ",
                item_description="Deposit for trip planning",
                item_cost=882.37,
                item_qty=1,
                item_total_amount=1,
            )
        ],
        invoice_date=datetime.date.fromisoformat("2025-10-19"),
        invoice_type=0,
        invoice_status=1,
        frequency="onetime",
        invoice_amount=982.37,
        discount=10,
        invoice_number="INV-3",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request:** `InvoiceDataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">delete_attached_from_invoice</a>(...) -> InvoiceResponseWithoutData</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes an invoice that's attached to a file.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.delete_attached_from_invoice(
    filename="0_Bill.pdf",
    id_invoice=23548884,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**filename:** `str` 

The filename in Payabli. Filename is `zipName` in response to a request to `/api/Invoice/{idInvoice}`. Here, the filename is `0_Bill.pdf``. 
"DocumentsRef": {
  "zipfile": "inva_269.zip",
  "filelist": [
    {
      "originalName": "Bill.pdf",
      "zipName": "0_Bill.pdf",
      "descriptor": null
    }
  ]
}
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">delete_invoice</a>(...) -> InvoiceResponseWithoutData</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a single invoice from an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.delete_invoice(
    id_invoice=23548884,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">edit_invoice</a>(...) -> InvoiceResponseWithoutData</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates details for a single invoice in an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, BillData, BillItem
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.edit_invoice(
    id_invoice=332,
    invoice_data=BillData(
        items=[
            BillItem(
                item_product_name="Deposit",
                item_description="Deposit for trip planning",
                item_cost=882.37,
                item_qty=1,
            )
        ],
        invoice_date=datetime.date.fromisoformat("2025-10-19"),
        invoice_amount=982.37,
        invoice_number="INV-6",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**request:** `InvoiceDataRequest` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[bool]` — When `true`, the request creates a new customer record, regardless of whether customer identifiers match an existing customer.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">get_attached_file_from_invoice</a>(...) -> FileContent</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a file attached to an invoice.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.get_attached_file_from_invoice(
    id_invoice=1,
    filename="filename",
    return_object=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**filename:** `str` 

The filename in Payabli. Filename is `zipName` in the response to a request to `/api/Invoice/{idInvoice}`. Here, the filename is `0_Bill.pdf``. 
```
  "DocumentsRef": {
    "zipfile": "inva_269.zip",
    "filelist": [
      {
        "originalName": "Bill.pdf",
        "zipName": "0_Bill.pdf",
        "descriptor": null
      }
    ]
  }
  ```
    
</dd>
</dl>

<dl>
<dd>

**return_object:** `typing.Optional[bool]` — When `true`, the request returns the file content as a Base64-encoded string.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">get_invoice</a>(...) -> GetInvoiceRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a single invoice by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.get_invoice(
    id_invoice=23548884,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">get_invoice_number</a>(...) -> InvoiceNumberResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the next available invoice number for a paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.get_invoice_number(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">list_invoices</a>(...) -> QueryInvoiceResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of invoices for an entrypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.list_invoices(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:

- `invoiceDate` (gt, ge, lt, le, eq, ne)
- `dueDate` (gt, ge, lt, le, eq, ne)
- `sentDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin,ne, eq)
- `invoiceType` (eq, ne)
- `payTerms` (in, nin, eq, ne)
- `paypointId` (ne, eq)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paidAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `invoiceNumber` (ct, nct, eq, ne)
- `purchaseOrder` (ct, nct, eq, ne)
- `itemProductCode` (ct, nct)
- `itemDescription` (ct, nct)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq)
- `paylinkId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:
  
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20 return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">list_invoices_org</a>(...) -> QueryInvoiceResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of invoices for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.list_invoices_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:

- `invoiceDate` (gt, ge, lt, le, eq, ne)
- `dueDate` (gt, ge, lt, le, eq, ne)
- `sentDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin,ne, eq)
- `invoiceType` (eq, ne)
- `payTerms` (in, nin, eq, ne)
- `paypointId` (ne, eq)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `paidAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `invoiceNumber` (ct, nct, eq, ne)
- `purchaseOrder` (ct, nct, eq, ne)
- `itemProductCode` (ct, nct)
- `itemDescription` (ct, nct)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq)
- `paylinkId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name

List of comparison accepted - enclosed between parentheses:

- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20 return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">send_invoice</a>(...) -> SendInvoiceResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Sends an invoice from an entrypoint via email.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.send_invoice(
    id_invoice=23548884,
    attachfile=True,
    mail_2="tamara@example.com",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**attachfile:** `typing.Optional[bool]` — When `true`, attaches a PDF version of invoice to the email.
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `typing.Optional[str]` — Email address where the invoice will be sent to. If this parameter isn't included, Payabli uses the email address on file for the customer owner of the invoice.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.invoice.<a href="src/seed/invoice/client.py">get_invoice_pdf</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Export a single invoice in PDF format.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.invoice.get_invoice_pdf(
    id_invoice=23548884,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## LineItem
<details><summary><code>client.line_item.<a href="src/seed/line_item/client.py">add_item</a>(...) -> PayabliApiResponse6</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Adds products and services to an entrypoint's catalog. These are used as line items for invoicing and transactions. In the response, "responseData" displays the item's code.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.line_item.add_item(
    entry="47cae3d74",
    item_product_code="M-DEPOSIT",
    item_product_name="Materials deposit",
    item_description="Deposit for materials",
    item_commodity_code="010",
    item_unit_of_measure="SqFt",
    item_cost=12.45,
    item_qty=1,
    item_mode=0,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request:** `LineItem` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[str]` — A unique ID you can include to prevent duplicating objects or transactions if a request is sent more than once. This key isn't generated in Payabli, you must generate it yourself. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.line_item.<a href="src/seed/line_item/client.py">delete_item</a>(...) -> DeleteItemResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes an item.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.line_item.delete_item(
    line_item_id=700,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**line_item_id:** `int` — ID for the line item (also known as a product, service, or item).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.line_item.<a href="src/seed/line_item/client.py">get_item</a>(...) -> LineItemQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets an item by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.line_item.get_item(
    line_item_id=700,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**line_item_id:** `int` — ID for the line item (also known as a product, service, or item).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.line_item.<a href="src/seed/line_item/client.py">list_line_items</a>(...) -> QueryResponseItems</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of line items and their details from an entrypoint. Line items are also known as items, products, and services. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.line_item.list_line_items(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20

</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:

  - `categories` (ct, nct)
  - `code` (ne, eq, ct, nct)
  - `commodityCode` (ne, eq, ct, nct)
  - `createdDate` (gt, ge, lt, le, eq, ne)
  - `description` (ne, eq, ct, nct)
  - `externalPaypointID` (ct, nct, ne, eq)
  - `mode` (eq, ne)
  - `name` (ne, eq, ct, nct)
  - `orgName` (ne, eq, ct, nct)
  - `paypointDba` (ne, eq, ct, nct)
  - `paypointId` (ne, eq)
  - `paypointLegal` (ne, eq, ct, nct)
  - `quantity` (gt, ge, lt, le, eq, ne)
  - `uom` (ne, eq, ct, nct)
  - `updatedDate` (gt, ge, lt, le, eq, ne)
  - `value` (gt, ge, lt, le, eq, ne)

List of comparison accepted - enclosed between parentheses:

- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: name(ct)=john return all records with name containing john
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.line_item.<a href="src/seed/line_item/client.py">update_item</a>(...) -> PayabliApiResponse6</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates an item.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.line_item.update_item(
    line_item_id=700,
    item_cost=12.45,
    item_qty=1,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**line_item_id:** `int` — ID for the line item (also known as a product, service, or item).
    
</dd>
</dl>

<dl>
<dd>

**request:** `LineItem` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MoneyIn
<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">authorize</a>(...) -> AuthResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorize a card transaction. This returns an authorization code and reserves funds for the merchant. Authorized transactions aren't flagged for settlement until [captured](/developers/api-reference/moneyin/capture-an-authorized-transaction).
Only card transactions can be authorized. This endpoint can't be used for ACH transactions.
<Tip>
  Consider migrating to the [v2 Authorize endpoint](/developers/api-reference/moneyinV2/authorize-a-transaction) to take advantage of unified response codes and improved response consistency.
</Tip>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetail, PayMethodCredit
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.authorize(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    ipaddress="255.255.255.255",
    payment_details=PaymentDetail(
        service_fee=0,
        total_amount=100,
    ),
    payment_method=PayMethodCredit(
        cardcvv="999",
        cardexp="02/27",
        card_holder="John Cassian",
        cardnumber="4111111111111111",
        cardzip="12345",
        initiator="payor",
        method="card",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `TransRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">capture</a>(...) -> CaptureResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

<Warning>
  This endpoint is deprecated and will be sunset on November 24, 2025. Migrate to [POST `/capture/{transId}`](/developers/api-reference/moneyin/capture-an-authorized-transaction)`.
</Warning>
  
  Capture an [authorized
transaction](/developers/api-reference/moneyin/authorize-a-transaction) to complete the transaction and move funds from the customer to merchant account.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.capture(
    trans_id="10-7d9cd67d-2d5d-4cd7-a1b7-72b8b201ec13",
    amount=0,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` — Amount to be captured. The amount can't be greater the original total amount of the transaction. `0` captures the total amount authorized in the transaction. Partial captures aren't supported.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">capture_auth</a>(...) -> CaptureResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Capture an [authorized transaction](/developers/api-reference/moneyin/authorize-a-transaction) to complete the transaction and move funds from the customer to merchant account. 

You can use this endpoint to capture both full and partial amounts of the original authorized transaction. See [Capture an authorized transaction](/developers/developer-guides/pay-in-auth-and-capture) for more information about this endpoint.

<Tip>
Consider migrating to the [v2 Capture endpoint](/developers/api-reference/moneyinV2/capture-an-authorized-transaction) to take advantage of unified response codes and improved response consistency.
</Tip>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.money_in import CapturePaymentDetails

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.capture_auth(
    trans_id="10-7d9cd67d-2d5d-4cd7-a1b7-72b8b201ec13",
    payment_details=CapturePaymentDetails(
        total_amount=105,
        service_fee=5,
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request:** `CaptureRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">credit</a>(...) -> PayabliApiResponse0</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Make a temporary microdeposit in a customer account to verify the customer's ownership and access to the target account. Reverse the microdeposit with `reverseCredit`. Payabli doesn't automatically make microdeposits when you add a bank account, you must manually make the requests.

This feature must be enabled by Payabli on a per-merchant basis. Contact support for help. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetailCredit
from seed.environment import SeedApiEnvironment
from seed.money_in import RequestCreditPaymentMethod

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.credit(
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
    customer_data=PayorDataRequest(
        billing_address_1="5127 Linkwood ave",
        customer_number="100",
    ),
    entrypoint="my-entrypoint",
    payment_details=PaymentDetailCredit(
        service_fee=0,
        total_amount=1,
    ),
    payment_method=RequestCreditPaymentMethod(
        ach_account="88354454",
        ach_account_type="Checking",
        ach_holder="John Smith",
        ach_routing="021000021",
        method="ach",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**customer_data:** `PayorDataRequest` — Object describing the customer/payor.
    
</dd>
</dl>

<dl>
<dd>

**payment_details:** `PaymentDetailCredit` 
    
</dd>
</dl>

<dl>
<dd>

**payment_method:** `RequestCreditPaymentMethod` — Object describing the ACH payment method to use for transaction.
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**account_id:** `typing.Optional[AccountId]` 
    
</dd>
</dl>

<dl>
<dd>

**entrypoint:** `typing.Optional[Entrypointfield]` 
    
</dd>
</dl>

<dl>
<dd>

**order_description:** `typing.Optional[Orderdescription]` 
    
</dd>
</dl>

<dl>
<dd>

**order_id:** `typing.Optional[OrderId]` 
    
</dd>
</dl>

<dl>
<dd>

**source:** `typing.Optional[Source]` 
    
</dd>
</dl>

<dl>
<dd>

**subdomain:** `typing.Optional[Subdomain]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">details</a>(...) -> TransactionQueryRecordsCustomer</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a processed transaction's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.details(
    trans_id="45-as456777hhhhhhhhhh77777777-324",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">getpaid</a>(...) -> PayabliApiResponseGetPaid</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Make a single transaction. This method authorizes and captures a payment in one step.

  <Tip>
  Consider migrating to the [v2 Make a transaction endpoint](/developers/api-reference/moneyinV2/make-a-transaction) to take advantage of unified response codes and improved response consistency.
  </Tip>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetail, PayMethodCredit
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.getpaid(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    ipaddress="255.255.255.255",
    payment_details=PaymentDetail(
        service_fee=0,
        total_amount=100,
    ),
    payment_method=PayMethodCredit(
        cardcvv="999",
        cardexp="02/27",
        card_holder="John Cassian",
        cardnumber="4111111111111111",
        cardzip="12345",
        initiator="payor",
        method="card",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `TransRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**ach_validation:** `typing.Optional[AchValidation]` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**include_details:** `typing.Optional[bool]` — When `true`, transactionDetails object is returned in the response. See a full example of the `transactionDetails` object in the [Transaction integration guide](/developers/developer-guides/money-in-transaction-add#includedetailstrue-response).
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**validation_code:** `typing.Optional[str]` — Value obtained from user when an API generated CAPTCHA is used in payment page
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">reverse</a>(...) -> ReverseResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

A reversal either refunds or voids a transaction independent of the transaction's settlement status. Send a reversal request for a transaction, and Payabli automatically determines whether it's a refund or void. You don't need to know whether the transaction is settled or not.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.reverse(
    amount=0,
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` 


Amount to reverse from original transaction, minus any service fees charged on the original transaction.

The amount provided can't be greater than the original total amount of the transaction, minus service fees. For example, if a transaction was $90 plus a $10 service fee, you can reverse up to $90. 

An amount equal to zero will refunds the total amount authorized minus any service fee.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">refund</a>(...) -> RefundResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund a transaction that has settled and send money back to the account holder. If a transaction hasn't been settled, void it instead.

  <Tip>
  Consider migrating to the [v2 Refund endpoint](/developers/api-reference/moneyinV2/refund-a-settled-transaction) to take advantage of unified response codes and improved response consistency.
  </Tip>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.refund(
    amount=0,
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` 


Amount to refund from original transaction, minus any service fees charged on the original transaction. 

The amount provided can't be greater than the original total amount of the transaction, minus service fees. For example, if a transaction was \$90 plus a \$10 service fee, you can refund up to \$90.

An amount equal to zero will refund the total amount authorized minus any service fee.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">refund_with_instructions</a>(...) -> RefundWithInstructionsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refunds a settled transaction with split instructions.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, RefundDetail, SplitFundingRefundContent
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.refund_with_instructions(
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
    idempotency_key="8A29FC40-CA47-1067-B31D-00DD010662DB",
    source="api",
    order_description="Materials deposit",
    amount=100,
    refund_details=RefundDetail(
        split_refunding=[
            SplitFundingRefundContent(
                origination_entry_point="7f1a381696",
                account_id="187-342",
                description="Refunding undelivered materials",
                amount=60,
            ),
            SplitFundingRefundContent(
                origination_entry_point="7f1a381696",
                account_id="187-343",
                description="Refunding deposit for undelivered materials",
                amount=40,
            )
        ],
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**amount:** `typing.Optional[float]` 


Amount to refund from original transaction, minus any service fees charged on the original transaction. 

The amount provided can't be greater than the original total amount of the transaction, minus service fees. For example, if a transaction was $90 plus a $10 service fee, you can refund up to $90. 

An amount equal to zero will refund the total amount authorized minus any service fee.
    
</dd>
</dl>

<dl>
<dd>

**ipaddress:** `typing.Optional[IpAddress]` 
    
</dd>
</dl>

<dl>
<dd>

**order_description:** `typing.Optional[Orderdescription]` 
    
</dd>
</dl>

<dl>
<dd>

**order_id:** `typing.Optional[OrderId]` 
    
</dd>
</dl>

<dl>
<dd>

**refund_details:** `typing.Optional[RefundDetail]` 
    
</dd>
</dl>

<dl>
<dd>

**source:** `typing.Optional[Source]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">reverse_credit</a>(...) -> PayabliApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Reverse microdeposits that are used to verify customer account ownership and access. The `transId` value is returned in the success response for the original credit transaction made with `api/MoneyIn/makecredit`.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.reverse_credit(
    trans_id="45-as456777hhhhhhhhhh77777777-324",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">send_receipt_2_trans</a>(...) -> ReceiptResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send a payment receipt for a transaction.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.send_receipt_2_trans(
    trans_id="45-as456777hhhhhhhhhh77777777-324",
    email="example@email.com",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[str]` 

Email address where the payment receipt should be sent. 

If not provided, the email address on file for the user owner of the transaction is used.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">validate</a>(...) -> ValidateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Validates a card number without running a transaction or authorizing a charge.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.money_in import RequestPaymentValidatePaymentMethod

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.validate(
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
    entry_point="entry132",
    payment_method=RequestPaymentValidatePaymentMethod(
        method="card",
        cardnumber="4360000001000005",
        cardexp="12/29",
        cardzip="14602-8328",
        card_holder="Dianne Becker-Smith",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry_point:** `Entrypointfield` 
    
</dd>
</dl>

<dl>
<dd>

**payment_method:** `RequestPaymentValidatePaymentMethod` — Object describing payment method to use for transaction.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**account_id:** `typing.Optional[AccountId]` 
    
</dd>
</dl>

<dl>
<dd>

**order_description:** `typing.Optional[Orderdescription]` 
    
</dd>
</dl>

<dl>
<dd>

**order_id:** `typing.Optional[OrderId]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">void</a>(...) -> VoidResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cancel a transaction that hasn't been settled yet. Voiding non-captured authorizations prevents future captures. If a transaction has been settled, refund it instead.

  <Tip>
  Consider migrating to the [v2 Void endpoint](/developers/api-reference/moneyinV2/void-a-transaction) to take advantage of unified response codes and improved response consistency.
  </Tip>
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.void(
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">getpaidv_2</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Make a single transaction. This method authorizes and captures a payment in one step. This is the v2 version of the `api/MoneyIn/getpaid` endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetail, PayMethodCredit
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.getpaidv_2(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    ipaddress="255.255.255.255",
    payment_details=PaymentDetail(
        service_fee=0,
        total_amount=100,
    ),
    payment_method=PayMethodCredit(
        cardcvv="999",
        cardexp="02/27",
        card_holder="John Cassian",
        cardnumber="4111111111111111",
        cardzip="12345",
        initiator="payor",
        method="card",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `TransRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**ach_validation:** `typing.Optional[AchValidation]` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**validation_code:** `typing.Optional[str]` — Value obtained from user when an API generated CAPTCHA is used in payment page
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">authorizev_2</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorize a card transaction. This returns an authorization code and reserves funds for the merchant. Authorized transactions aren't flagged for settlement until captured. This is the v2 version of the `api/MoneyIn/authorize` endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.

**Note**: Only card transactions can be authorized. This endpoint can't be used for ACH transactions.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetail, PayMethodCredit
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.authorizev_2(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    ipaddress="255.255.255.255",
    payment_details=PaymentDetail(
        service_fee=0,
        total_amount=100,
    ),
    payment_method=PayMethodCredit(
        cardcvv="999",
        cardexp="02/27",
        card_holder="John Cassian",
        cardnumber="4111111111111111",
        cardzip="12345",
        initiator="payor",
        method="card",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `TransRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">capturev_2</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Capture an authorized transaction to complete the transaction and move funds from the customer to merchant account. This is the v2 version of the `api/MoneyIn/capture/{transId}` endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.money_in import CapturePaymentDetails

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.capturev_2(
    trans_id="10-7d9cd67d-2d5d-4cd7-a1b7-72b8b201ec13",
    payment_details=CapturePaymentDetails(
        total_amount=105,
        service_fee=5,
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request:** `CaptureRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">refundv_2</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Give a full refund for a transaction that has settled and send money back to the account holder. To perform a partial refund, see [Partially refund a transaction](developers/api-reference/moneyinV2/partial-refund-a-settled-transaction).

This is the v2 version of the refund endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.refundv_2(
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">refundv_2_amount</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refund a transaction that has settled and send money back to the account holder. If `amount` is omitted or set to 0, performs a full refund. When a non-zero `amount` is provided, this endpoint performs a partial refund.

This is the v2 version of the refund endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.refundv_2_amount(
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
    amount=0,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**amount:** `float` — Amount to refund from original transaction, minus any service fees charged on the original transaction. If omitted or set to 0, performs a full refund.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_in.<a href="src/seed/money_in/client.py">voidv_2</a>(...) -> V2TransactionResponseWrapper</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cancel a transaction that hasn't been settled yet. Voiding non-captured authorizations prevents future captures. This is the v2 version of the `api/MoneyIn/void/{transId}` endpoint, and returns the unified response format. See [Pay In unified response codes reference](/guides/pay-in-unified-response-codes-reference) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_in.voidv_2(
    trans_id="10-3ffa27df-b171-44e0-b251-e95fbfc7a723",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## MoneyOut
<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">authorize_out</a>(...) -> AuthCapturePayoutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Authorizes transaction for payout. Authorized transactions aren't flagged for settlement until captured. Use `referenceId` returned in the response to capture the transaction. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.money_out_types import RequestOutAuthorizeInvoiceData, RequestOutAuthorizePaymentDetails, AuthorizePaymentMethod, RequestOutAuthorizeVendorData

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.authorize_out(
    entry_point="48acde49",
    invoice_data=[
        RequestOutAuthorizeInvoiceData(
            bill_id=54323,
        )
    ],
    order_description="Window Painting",
    payment_details=RequestOutAuthorizePaymentDetails(
        total_amount=47,
        unbundled=False,
    ),
    payment_method=AuthorizePaymentMethod(
        method="managed",
    ),
    vendor_data=RequestOutAuthorizeVendorData(
        vendor_number="7895433",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `AuthorizePayoutBody` 
    
</dd>
</dl>

<dl>
<dd>

**allow_duplicated_bills:** `typing.Optional[bool]` — When `true`, the authorization bypasses the requirement for unique bills, identified by vendor invoice number. This allows you to make more than one payout authorization for a bill, like a split payment.
    
</dd>
</dl>

<dl>
<dd>

**do_not_create_bills:** `typing.Optional[bool]` — When `true`, Payabli won't automatically create a bill for this payout transaction.
    
</dd>
</dl>

<dl>
<dd>

**force_vendor_creation:** `typing.Optional[bool]` — When `true`, the request creates a new vendor record, regardless of whether the vendor already exists.
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">cancel_all_out</a>(...) -> CaptureAllOutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cancels an array of payout transactions.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.cancel_all_out(
    request=[
        "2-29",
        "2-28",
        "2-27"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `typing.List[str]` — Array of identifiers of payout transactions to cancel.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">cancel_out_get</a>(...) -> PayabliApiResponse0000</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cancel a payout transaction by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.cancel_out_get(
    reference_id="129-219",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**reference_id:** `str` — The ID for the payout transaction. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">cancel_out_delete</a>(...) -> PayabliApiResponse0000</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cancel a payout transaction by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.cancel_out_delete(
    reference_id="129-219",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**reference_id:** `str` — The ID for the payout transaction. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">capture_all_out</a>(...) -> CaptureAllOutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Captures an array of authorized payout transactions for settlement. The maximum number of transactions that can be captured in a single request is 500.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.capture_all_out(
    request=[
        "2-29",
        "2-28",
        "2-27"
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `typing.List[str]` — Array of identifiers of payout transactions to capture.  
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">capture_out</a>(...) -> AuthCapturePayoutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Captures a single authorized payout transaction by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.capture_out(
    reference_id="129-219",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**reference_id:** `str` — The ID for the payout transaction. 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">payout_details</a>(...) -> BillDetailResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns details for a processed money out transaction.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.payout_details(
    trans_id="45-as456777hhhhhhhhhh77777777-324",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — ReferenceId for the transaction (PaymentId).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">v_card_get</a>(...) -> VCardGetResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves vCard details for a single card in an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.v_card_get(
    card_token="20230403315245421165",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**card_token:** `str` — ID for a virtual card.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">send_v_card_link</a>(...) -> OperationResult</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Sends a virtual card link via email to the vendor associated with the `transId`.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.send_v_card_link(
    trans_id="01K33Z6YQZ6GD5QVKZ856MJBSC",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — The transaction ID of the virtual card payout. The ID is returned as `ReferenceId` in the response when you authorize a payout with POST /MoneyOut/authorize.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">get_check_image</a>(...) -> str</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve the image of a check associated with a processed transaction. 
The check image is returned in the response body as a base64-encoded string. 
The check image is only available for payouts that have been processed.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.get_check_image(
    asset_name="check133832686289732320_01JKBNZ5P32JPTZY8XXXX000000.pdf",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**asset_name:** `str` 

Name of the check asset to retrieve. This is returned as `filename` in the `CheckData` object 
in the response when you make a GET request to `/MoneyOut/details/{transId}`.
```
    "CheckData": {
      "ftype": "PDF",
      "filename": "check133832686289732320_01JKBNZ5P32JPTZY8XXXX000000.pdf",
      "furl": "",
      "fContent": ""
  }
```
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">update_check_payment_status</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates the status of a processed check payment transaction. This endpoint handles the status transition, updates related bills, creates audit events, and triggers notifications.

The transaction must meet all of the following criteria:
- **Status**: Must be in Processing or Processed status.
- **Payment method**: Must be a check payment method.

### Allowed status values

| Value | Status | Description |
|-------|--------|-------------|
| `0` | Cancelled/Voided | Cancels the check transaction. Reverts associated bills to their previous state (Approved or Active), creates "Cancelled" events, and sends a `payout_transaction_voidedcancelled` notification if the notification is enabled. |
| `5` | Paid | Marks the check transaction as paid. Updates associated bills to "Paid" status, creates "Paid" events, and sends a `payout_transaction_paid` notification if the notification is enabled. |
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.update_check_payment_status(
    trans_id="TRANS123456",
    check_payment_status="5",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — The Payabli transaction ID for the check payment.
    
</dd>
</dl>

<dl>
<dd>

**check_payment_status:** `AllowedCheckPaymentStatus` — The new status to apply to the check transaction. To mark a check as `Paid`, send 5. To mark a check as `Cancelled`, send 0.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.money_out.<a href="src/seed/money_out/client.py">reissue_out</a>(...) -> ReissuePayoutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Reissues a payout transaction with a new payment method. This creates a new transaction linked to the original and marks the original transaction as reissued.

The original transaction must be in **Processing** or **Processed** status. The payment method in the request body is used directly. The endpoint doesn't fall back to vendor-managed payment methods.

The new transaction goes through the standard authorize-and-capture flow automatically. Both the original and new transactions are linked through their event histories for audit purposes.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.money_out_types import ReissuePaymentMethod

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.money_out.reissue_out(
    trans_id="129-219",
    payment_method=ReissuePaymentMethod(
        method="ach",
        ach_account="9876543210",
        ach_account_type="savings",
        ach_routing="021000021",
        ach_holder="Acme Corp",
        ach_holder_type="business",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**trans_id:** `str` — The transaction ID of the payout to reissue.
    
</dd>
</dl>

<dl>
<dd>

**request:** `ReissuePayoutBody` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Notification
<details><summary><code>client.notification.<a href="src/seed/notification/client.py">add_notification</a>(...) -> PayabliApiResponseNotifications</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Create a new notification or autogenerated report. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, NotificationStandardRequest, NotificationStandardRequestContent
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notification.add_notification(
    request=NotificationStandardRequest(
        content=NotificationStandardRequestContent(
            event_type="CreatedApplication",
        ),
        frequency="untilcancelled",
        method="web",
        owner_id=236,
        owner_type=0,
        status=1,
        target="https://webhook.site/2871b8f8-edc7-441a-b376-98d8c8e33275",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `AddNotificationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notification.<a href="src/seed/notification/client.py">delete_notification</a>(...) -> PayabliApiResponseNotifications</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a single notification or autogenerated report.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notification.delete_notification(
    n_id="1717",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**n_id:** `str` — Notification ID. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notification.<a href="src/seed/notification/client.py">get_notification</a>(...) -> NotificationQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a single notification or autogenerated report's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notification.get_notification(
    n_id="1717",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**n_id:** `str` — Notification ID. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notification.<a href="src/seed/notification/client.py">update_notification</a>(...) -> PayabliApiResponseNotifications</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a notification or autogenerated report. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, NotificationStandardRequest, NotificationStandardRequestContent
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notification.update_notification(
    n_id="1717",
    request=NotificationStandardRequest(
        content=NotificationStandardRequestContent(
            event_type="ApprovedPayment",
        ),
        frequency="untilcancelled",
        method="email",
        owner_id=136,
        owner_type=0,
        status=1,
        target="newemail@email.com",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**n_id:** `str` — Notification ID. 
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdateNotificationRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notification.<a href="src/seed/notification/client.py">get_report_file</a>(...) -> File</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets a copy of a generated report by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notification.get_report_file(
    id=1000000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — Report ID
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Notificationlogs
<details><summary><code>client.notificationlogs.<a href="src/seed/notificationlogs/client.py">search_notification_logs</a>(...) -> typing.List[NotificationLog]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Search notification logs with filtering and pagination.
  - Start date and end date cannot be more than 30 days apart
  - Either `orgId` or `paypointId` must be provided

This endpoint requires the `notifications_create` OR `notifications_read` permission.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notificationlogs.search_notification_logs(
    page_size=20,
    start_date=datetime.datetime.fromisoformat("2024-01-01T00:00:00+00:00"),
    end_date=datetime.datetime.fromisoformat("2024-01-31T23:59:59+00:00"),
    org_id=12345,
    notification_event="ActivatedMerchant",
    succeeded=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `NotificationLogSearchRequest` 
    
</dd>
</dl>

<dl>
<dd>

**page_size:** `typing.Optional[Pagesize]` 
    
</dd>
</dl>

<dl>
<dd>

**page:** `typing.Optional[int]` — The page number to retrieve. Defaults to 1 if not provided.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notificationlogs.<a href="src/seed/notificationlogs/client.py">get_notification_log</a>(...) -> NotificationLogDetail</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get detailed information for a specific notification log entry.
This endpoint requires the `notifications_create` OR `notifications_read` permission.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import uuid

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notificationlogs.get_notification_log(
    uuid_=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**uuid:** `uuid.UUID` — The notification log entry.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notificationlogs.<a href="src/seed/notificationlogs/client.py">retry_notification_log</a>(...) -> NotificationLogDetail</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retry sending a specific notification.

**Permissions:** notifications_create
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import uuid

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notificationlogs.retry_notification_log(
    uuid_=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**uuid:** `uuid.UUID` — Unique id
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.notificationlogs.<a href="src/seed/notificationlogs/client.py">bulk_retry_notification_logs</a>(...)</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retry sending multiple notifications (maximum 50 IDs).
This is an async process, so use the search endpoint again to check the notification status.

This endpoint requires the `notifications_create` permission.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
import uuid

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.notificationlogs.bulk_retry_notification_logs(
    request=[
        uuid.UUID("550e8400-e29b-41d4-a716-446655440000"),
        uuid.UUID("550e8400-e29b-41d4-a716-446655440001"),
        uuid.UUID("550e8400-e29b-41d4-a716-446655440002")
    ],
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `BulkRetryRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Ocr
<details><summary><code>client.ocr.<a href="src/seed/ocr/client.py">ocr_document_form</a>(...) -> PayabliApiResponseOcr</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to upload an image file for OCR processing. The accepted file formats include PDF, JPG, JPEG, PNG, and GIF. Specify the desired type of result (either 'bill' or 'invoice') in the path parameter `typeResult`. The response will contain the OCR processing results, including extracted data such as bill number, vendor information, bill items, and more.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.ocr.ocr_document_form(
    type_result="typeResult",
    ftype="pdf",
    filename="filename",
    furl="furl",
    f_content="fContent",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**type_result:** `TypeResult` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `FileContentImageOnly` — The image file to OCR. Accepted formats include PDF, JPG, JPEG, PNG, GIF.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.ocr.<a href="src/seed/ocr/client.py">ocr_document_json</a>(...) -> PayabliApiResponseOcr</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to submit a Base64-encoded image file for OCR processing. The accepted file formats include PDF, JPG, JPEG, PNG, and GIF. Specify the desired type of result (either 'bill' or 'invoice') in the path parameter `typeResult`. The response will contain the OCR processing results, including extracted data such as bill number, vendor information, bill items, and more.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.ocr.ocr_document_json(
    type_result="typeResult",
    ftype="pdf",
    filename="filename",
    furl="furl",
    f_content="fContent",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**type_result:** `TypeResult` 
    
</dd>
</dl>

<dl>
<dd>

**request:** `FileContentImageOnly` — Base64-encoded file content for OCR processing
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Organization
<details><summary><code>client.organization.<a href="src/seed/organization/client.py">add_organization</a>(...) -> AddOrganizationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates an organization under a parent organization. This is also referred to as a suborganization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, Instrument, Contacts, FileContent
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.add_organization(
    idempotency_key="6B29FC40-CA47-1067-B31D-00DD010662DA",
    billing_info=Instrument(
        ach_account="123123123",
        ach_routing="123123123",
        billing_address="123 Walnut Street",
        billing_city="Johnson City",
        billing_country="US",
        billing_state="TN",
        billing_zip="37615",
    ),
    contacts=[
        Contacts(
            contact_email="herman@hermanscoatings.com",
            contact_name="Herman Martinez",
            contact_phone="3055550000",
            contact_title="Owner",
        )
    ],
    has_billing=True,
    has_residual=True,
    org_address="123 Walnut Street",
    org_city="Johnson City",
    org_country="US",
    org_entry_name="pilgrim-planner",
    org_id="123",
    org_logo=FileContent(
        f_content="TXkgdGVzdCBmaWxlHJ==...",
        filename="my-doc.pdf",
        ftype="pdf",
        furl="https://mysite.com/my-doc.pdf",
    ),
    org_name="Pilgrim Planner",
    org_parent_id=236,
    org_state="TN",
    org_timezone=-5,
    org_type=0,
    org_website="www.pilgrimageplanner.com",
    org_zip="37615",
    reply_to_email="email@example.com",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_name:** `Orgname` 
    
</dd>
</dl>

<dl>
<dd>

**org_type:** `Orgtype` 
    
</dd>
</dl>

<dl>
<dd>

**reply_to_email:** `ReplyToEmail` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**services:** `typing.Optional[typing.List[ServiceCost]]` 
    
</dd>
</dl>

<dl>
<dd>

**billing_info:** `typing.Optional[Instrument]` 
    
</dd>
</dl>

<dl>
<dd>

**contacts:** `typing.Optional[ContactsField]` 
    
</dd>
</dl>

<dl>
<dd>

**has_billing:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**has_residual:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**org_address:** `typing.Optional[Orgaddress]` 
    
</dd>
</dl>

<dl>
<dd>

**org_city:** `typing.Optional[Orgcity]` 
    
</dd>
</dl>

<dl>
<dd>

**org_country:** `typing.Optional[Orgcountry]` 
    
</dd>
</dl>

<dl>
<dd>

**org_entry_name:** `typing.Optional[Orgentryname]` 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `typing.Optional[Orgidstring]` 
    
</dd>
</dl>

<dl>
<dd>

**org_logo:** `typing.Optional[FileContent]` 
    
</dd>
</dl>

<dl>
<dd>

**org_parent_id:** `typing.Optional[OrgParentId]` 
    
</dd>
</dl>

<dl>
<dd>

**org_state:** `typing.Optional[Orgstate]` 
    
</dd>
</dl>

<dl>
<dd>

**org_timezone:** `typing.Optional[Orgtimezone]` 
    
</dd>
</dl>

<dl>
<dd>

**org_website:** `typing.Optional[Orgwebsite]` 
    
</dd>
</dl>

<dl>
<dd>

**org_zip:** `typing.Optional[Orgzip]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">delete_organization</a>(...) -> DeleteOrganizationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete an organization by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.delete_organization(
    org_id=123,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">edit_organization</a>(...) -> EditOrganizationResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates an organization's details by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, Contacts
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.edit_organization(
    org_id=123,
    contacts=[
        Contacts(
            contact_email="herman@hermanscoatings.com",
            contact_name="Herman Martinez",
            contact_phone="3055550000",
            contact_title="Owner",
        )
    ],
    org_address="123 Walnut Street",
    org_city="Johnson City",
    org_country="US",
    org_entry_name="pilgrim-planner",
    organization_data_org_id="123",
    org_name="Pilgrim Planner",
    org_state="TN",
    org_timezone=-5,
    org_type=0,
    org_website="www.pilgrimageplanner.com",
    org_zip="37615",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**services:** `typing.Optional[typing.List[ServiceCost]]` 
    
</dd>
</dl>

<dl>
<dd>

**billing_info:** `typing.Optional[Instrument]` 
    
</dd>
</dl>

<dl>
<dd>

**contacts:** `typing.Optional[ContactsField]` 
    
</dd>
</dl>

<dl>
<dd>

**has_billing:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**has_residual:** `typing.Optional[bool]` 
    
</dd>
</dl>

<dl>
<dd>

**org_address:** `typing.Optional[Orgaddress]` 
    
</dd>
</dl>

<dl>
<dd>

**org_city:** `typing.Optional[Orgcity]` 
    
</dd>
</dl>

<dl>
<dd>

**org_country:** `typing.Optional[Orgcountry]` 
    
</dd>
</dl>

<dl>
<dd>

**org_entry_name:** `typing.Optional[Orgentryname]` 
    
</dd>
</dl>

<dl>
<dd>

**organization_data_org_id:** `typing.Optional[Orgidstring]` 
    
</dd>
</dl>

<dl>
<dd>

**org_logo:** `typing.Optional[FileContent]` 
    
</dd>
</dl>

<dl>
<dd>

**org_name:** `typing.Optional[Orgname]` 
    
</dd>
</dl>

<dl>
<dd>

**org_parent_id:** `typing.Optional[OrgParentId]` 
    
</dd>
</dl>

<dl>
<dd>

**org_state:** `typing.Optional[Orgstate]` 
    
</dd>
</dl>

<dl>
<dd>

**org_timezone:** `typing.Optional[Orgtimezone]` 
    
</dd>
</dl>

<dl>
<dd>

**org_type:** `typing.Optional[Orgtype]` 
    
</dd>
</dl>

<dl>
<dd>

**org_website:** `typing.Optional[Orgwebsite]` 
    
</dd>
</dl>

<dl>
<dd>

**org_zip:** `typing.Optional[Orgzip]` 
    
</dd>
</dl>

<dl>
<dd>

**reply_to_email:** `typing.Optional[ReplyToEmail]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">get_basic_organization</a>(...) -> OrganizationQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets an organization's basic information by entry name (entrypoint identifier).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.get_basic_organization(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">get_basic_organization_by_id</a>(...) -> OrganizationQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets an organizations basic details by org ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.get_basic_organization_by_id(
    org_id=123,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">get_organization</a>(...) -> OrganizationQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves details for an organization by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.get_organization(
    org_id=123,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.organization.<a href="src/seed/organization/client.py">get_settings_organization</a>(...) -> SettingsQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves an organization's settings.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.organization.get_settings_organization(
    org_id=123,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PaymentLink
<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">add_pay_link_from_invoice</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a payment link for an invoice from the invoice ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ContactElement, InvoiceElement, LabelElement, Element, NoteElement, PageElement, MethodElement, MethodsList, MethodElementSettings, MethodElementSettingsApplePay, PayorElement, PayorFields, HeaderElement, PagelinkSetting, FileContent
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.add_pay_link_from_invoice(
    id_invoice=23548884,
    mail_2="jo@example.com; ceo@example.com",
    contact_us=ContactElement(
        email_label="Email",
        enabled=True,
        header="Contact Us",
        order=0,
        payment_icons=True,
        phone_label="Phone",
    ),
    invoices=InvoiceElement(
        enabled=True,
        invoice_link=LabelElement(
            enabled=True,
            label="View Invoice",
            order=0,
        ),
        order=0,
        view_invoice_details=LabelElement(
            enabled=True,
            label="Invoice Details",
            order=0,
        ),
    ),
    logo=Element(
        enabled=True,
        order=0,
    ),
    message_before_paying=LabelElement(
        enabled=True,
        label="Please review your payment details",
        order=0,
    ),
    notes=NoteElement(
        enabled=True,
        header="Additional Notes",
        order=0,
        placeholder="Enter any additional notes here",
        value="",
    ),
    page=PageElement(
        description="Complete your payment securely",
        enabled=True,
        header="Payment Page",
        order=0,
    ),
    payment_button=LabelElement(
        enabled=True,
        label="Pay Now",
        order=0,
    ),
    payment_methods=MethodElement(
        all_methods_checked=True,
        enabled=True,
        header="Payment Methods",
        methods=MethodsList(
            amex=True,
            apple_pay=True,
            discover=True,
            e_check=True,
            mastercard=True,
            visa=True,
        ),
        order=0,
        settings=MethodElementSettings(
            apple_pay=MethodElementSettingsApplePay(
                button_style="black",
                button_type="pay",
                language="en-US",
            ),
        ),
    ),
    payor=PayorElement(
        enabled=True,
        fields=[
            PayorFields(
                display=True,
                fixed=True,
                identifier=True,
                label="Full Name",
                name="fullName",
                order=0,
                required=True,
                validation="alpha",
                value="",
                width=0,
            )
        ],
        header="Payor Information",
        order=0,
    ),
    review=HeaderElement(
        enabled=True,
        header="Review Payment",
        order=0,
    ),
    settings=PagelinkSetting(
        color="#000000",
        custom_css_url="https://example.com/custom.css",
        language="en",
        page_logo=FileContent(
            f_content="PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDEwMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWNrZ3JvdW5kIC0tPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgZmlsbD0id2hpdGUiLz4KICAKICA8IS0tIENvbXBhbnkgSGVhZGVyIC0tPgogIDx0ZXh0IHg9IjQwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJjM2U1MCI+R3J1enlhIEFkdmVudHVyZSBPdXRmaXR0ZXJzPC90ZXh0PgogIDxsaW5lIHgxPSI0MCIgeTE9IjgwIiB4Mj0iNzYwIiB5Mj0iODAiIHN0cm9rZT0iIzJjM2U1MCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgCiAgPCEtLSBDb21wYW55IERldGFpbHMgLS0+CiAgPHRleHQgeD0iNDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj4xMjMgTW91bnRhaW4gVmlldyBSb2FkPC90ZXh0PgogIDx0ZXh0IHg9IjQwIiB5PSIxMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+VGJpbGlzaSwgR2VvcmdpYSAwMTA1PC90ZXh0PgogIDx0ZXh0IHg9IjQwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+VGVsOiArOTk1IDMyIDEyMyA0NTY3PC90ZXh0PgogIDx0ZXh0IHg9IjQwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+RW1haWw6IGluZm9AZ3J1enlhYWR2ZW50dXJlcy5jb208L3RleHQ+CgogIDwhLS0gSW52b2ljZSBUaXRsZSAtLT4KICA8dGV4dCB4PSI2MDAiIHk9IjExMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJjM2U1MCI+SU5WT0lDRTwvdGV4dD4KICA8dGV4dCB4PSI2MDAiIHk9IjE0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj5EYXRlOiAxMi8xMS8yMDI0PC90ZXh0PgogIDx0ZXh0IHg9IjYwMCIgeT0iMTYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPkludm9pY2UgIzogR1JaLTIwMjQtMTEyMzwvdGV4dD4KCiAgPCEtLSBCaWxsIFRvIFNlY3Rpb24gLS0+CiAgPHRleHQgeD0iNDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJjM2U1MCI+QklMTCBUTzo8L3RleHQ+CiAgPHJlY3QgeD0iNDAiIHk9IjIzNSIgd2lkdGg9IjMwMCIgaGVpZ2h0PSI4MCIgZmlsbD0iI2Y3ZjlmYSIvPgogIDx0ZXh0IHg9IjUwIiB5PSIyNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+W0N1c3RvbWVyIE5hbWVdPC90ZXh0PgogIDx0ZXh0IHg9IjUwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+W0FkZHJlc3MgTGluZSAxXTwvdGV4dD4KICA8dGV4dCB4PSI1MCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPltDaXR5LCBDb3VudHJ5XTwvdGV4dD4KCiAgPCEtLSBUYWJsZSBIZWFkZXJzIC0tPgogIDxyZWN0IHg9IjQwIiB5PSIzNDAiIHdpZHRoPSI3MjAiIGhlaWdodD0iMzAiIGZpbGw9IiMyYzNlNTAiLz4KICA8dGV4dCB4PSI1MCIgeT0iMzYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+RGVzY3JpcHRpb248L3RleHQ+CiAgPHRleHQgeD0iNDUwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5RdWFudGl0eTwvdGV4dD4KICA8dGV4dCB4PSI1NTAiIHk9IjM2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPlJhdGU8L3RleHQ+CiAgPHRleHQgeD0iNjgwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5BbW91bnQ8L3RleHQ+CgogIDwhLS0gVGFibGUgUm93cyAtLT4KICA8cmVjdCB4PSI0MCIgeT0iMzcwIiB3aWR0aD0iNzIwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZjdmOWZhIi8+CiAgPHRleHQgeD0iNTAiIHk9IjM5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj5Nb3VudGFpbiBDbGltYmluZyBFcXVpcG1lbnQgUmVudGFsPC90ZXh0PgogIDx0ZXh0IHg9IjQ1MCIgeT0iMzkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPjE8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSIzOTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+JDI1MC4wMDwvdGV4dD4KICA8dGV4dCB4PSI2ODAiIHk9IjM5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj4kMjUwLjAwPC90ZXh0PgoKICA8cmVjdCB4PSI0MCIgeT0iNDAwIiB3aWR0aD0iNzIwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI0MjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+R3VpZGVkIFRyZWsgUGFja2FnZSAtIDIgRGF5czwvdGV4dD4KICA8dGV4dCB4PSI0NTAiIHk9IjQyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj4xPC90ZXh0PgogIDx0ZXh0IHg9IjU1MCIgeT0iNDIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPiQ0MDAuMDA8L3RleHQ+CiAgPHRleHQgeD0iNjgwIiB5PSI0MjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+JDQwMC4wMDwvdGV4dD4KCiAgPHJlY3QgeD0iNDAiIHk9IjQzMCIgd2lkdGg9IjcyMCIgaGVpZ2h0PSIzMCIgZmlsbD0iI2Y3ZjlmYSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI0NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+U2FmZXR5IEVxdWlwbWVudCBQYWNrYWdlPC90ZXh0PgogIDx0ZXh0IHg9IjQ1MCIgeT0iNDUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPjE8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSI0NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+JDE1MC4wMDwvdGV4dD4KICA8dGV4dCB4PSI2ODAiIHk9IjQ1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj4kMTUwLjAwPC90ZXh0PgoKICA8IS0tIFRvdGFscyAtLT4KICA8bGluZSB4MT0iNDAiIHkxPSI0ODAiIHgyPSI3NjAiIHkyPSI0ODAiIHN0cm9rZT0iIzJjM2U1MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iNTUwIiB5PSI1MTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMzNDQ5NWUiPlN1YnRvdGFsOjwvdGV4dD4KICA8dGV4dCB4PSI2ODAiIHk9IjUxMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj4kODAwLjAwPC90ZXh0PgogIDx0ZXh0IHg9IjU1MCIgeT0iNTM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMzQ0OTVlIj5UYXggKDE4JSk6PC90ZXh0PgogIDx0ZXh0IHg9IjY4MCIgeT0iNTM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPiQxNDQuMDA8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSI1NzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyYzNlNTAiPlRvdGFsOjwvdGV4dD4KICA8dGV4dCB4PSI2ODAiIHk9IjU3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJjM2U1MCI+JDk0NC4wMDwvdGV4dD4KCiAgPCEtLSBQYXltZW50IFRlcm1zIC0tPgogIDx0ZXh0IHg9IjQwIiB5PSI2NDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyYzNlNTAiPlBheW1lbnQgVGVybXM8L3RleHQ+CiAgPHRleHQgeD0iNDAiIHk9IjY3MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjMzQ0OTVlIj5QYXltZW50IGlzIGR1ZSB3aXRoaW4gMzAgZGF5czwvdGV4dD4KICA8dGV4dCB4PSI0MCIgeT0iNjkwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPlBsZWFzZSBpbmNsdWRlIGludm9pY2UgbnVtYmVyIG9uIHBheW1lbnQ8L3RleHQ+CgogIDwhLS0gQmFuayBEZXRhaWxzIC0tPgogIDx0ZXh0IHg9IjQwIiB5PSI3MzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMyYzNlNTAiPkJhbmsgRGV0YWlsczwvdGV4dD4KICA8dGV4dCB4PSI0MCIgeT0iNzYwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPkJhbms6IEJhbmsgb2YgR2VvcmdpYTwvdGV4dD4KICA8dGV4dCB4PSI0MCIgeT0iNzgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzNDQ5NWUiPklCQU46IEdFMTIzNDU2Nzg5MDEyMzQ1Njc4PC90ZXh0PgogIDx0ZXh0IHg9IjQwIiB5PSI4MDAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0NDk1ZSI+U1dJRlQ6IEJBR0FHRTIyPC90ZXh0PgoKICA8IS0tIEZvb3RlciAtLT4KICA8bGluZSB4MT0iNDAiIHkxPSI5MDAiIHgyPSI3NjAiIHkyPSI5MDAiIHN0cm9rZT0iIzJjM2U1MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHRleHQgeD0iNDAiIHk9IjkzMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjN2Y4YzhkIj5UaGFuayB5b3UgZm9yIGNob29zaW5nIEdydXp5YSBBZHZlbnR1cmUgT3V0Zml0dGVyczwvdGV4dD4KICA8dGV4dCB4PSI0MCIgeT0iOTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM3ZjhjOGQiPnd3dy5ncnV6eWFhZHZlbnR1cmVzLmNvbTwvdGV4dD4KPC9zdmc+Cg==",
            filename="logo.jpg",
            ftype="jpg",
            furl="",
        ),
        redirect_after_approve=True,
        redirect_after_approve_url="https://example.com/success",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_invoice:** `int` — Invoice ID
    
</dd>
</dl>

<dl>
<dd>

**request:** `PaymentPageRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**amount_fixed:** `typing.Optional[bool]` — Indicates whether customer can modify the payment amount. A value of `true` means the amount isn't modifiable, a value `false` means the payor can modify the amount to pay.
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `typing.Optional[str]` — List of recipient email addresses. When there is more than one, separate them by a semicolon (;).
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">add_pay_link_from_bill</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a payment link for a bill from the bill ID. The vendor receives a secure page where they can select their preferred payment method (ACH, virtual card, or check) and complete the payment.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ContactElement, Element, LabelElement, NoteElement, PageElement, HeaderElement, PagelinkSetting
from seed.environment import SeedApiEnvironment
from seed.money_out_types import MethodElementOut, MethodsListOut

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.add_pay_link_from_bill(
    bill_id=23548884,
    mail_2="jo@example.com; ceo@example.com",
    contact_us=ContactElement(
        email_label="Email",
        enabled=True,
        header="Contact Us",
        order=0,
        payment_icons=True,
        phone_label="Phone",
    ),
    logo=Element(
        enabled=True,
        order=0,
    ),
    message_before_paying=LabelElement(
        enabled=True,
        label="Please review your payment details",
        order=0,
    ),
    notes=NoteElement(
        enabled=True,
        header="Additional Notes",
        order=0,
        placeholder="Enter any additional notes here",
        value="",
    ),
    page=PageElement(
        description="Get paid securely",
        enabled=True,
        header="Payment Page",
        order=0,
    ),
    payment_button=LabelElement(
        enabled=True,
        label="Pay Now",
        order=0,
    ),
    payment_methods=MethodElementOut(
        all_methods_checked=True,
        allow_multiple_methods=True,
        default_method="vcard",
        enabled=True,
        header="Payment Methods",
        methods=MethodsListOut(
            ach=True,
            check=True,
            vcard=True,
        ),
        order=0,
        show_preview_virtual_card=True,
    ),
    review=HeaderElement(
        enabled=True,
        header="Review Payment",
        order=0,
    ),
    settings=PagelinkSetting(
        color="#000000",
        language="en",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**bill_id:** `int` — The Payabli ID for the bill.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PaymentPageRequestBodyOut` 
    
</dd>
</dl>

<dl>
<dd>

**amount_fixed:** `typing.Optional[bool]` — Indicates whether customer can modify the payment amount. A value of `true` means the amount isn't modifiable, a value `false` means the payor can modify the amount to pay.
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `typing.Optional[str]` — List of recipient email addresses. When there is more than one, separate them by a semicolon (;).
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">delete_pay_link_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a payment link by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.delete_pay_link_from_id(
    pay_link_id="2325-XXXXXXX-90b1-4598-b6c7-44cdcbf495d7-1234",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**pay_link_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">get_pay_link_from_id</a>(...) -> GetPayLinkFromIdResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a payment link by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.get_pay_link_from_id(
    paylink_id="paylinkId",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**paylink_id:** `str` — ID for payment link
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">push_pay_link_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Send a payment link to the specified email addresses or phone numbers.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PushPayLinkRequest_Sms
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.push_pay_link_from_id(
    pay_link_id="payLinkId",
    request=PushPayLinkRequest_Sms(),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**pay_link_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PushPayLinkRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">refresh_pay_link_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Refresh a payment link's content after an update.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.refresh_pay_link_from_id(
    pay_link_id="payLinkId",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**pay_link_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**amount_fixed:** `typing.Optional[bool]` — Indicates whether customer can modify the payment amount. A value of `true` means the amount isn't modifiable, a value `false` means the payor can modify the amount to pay.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">send_pay_link_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Sends a payment link to the specified email addresses. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.send_pay_link_from_id(
    pay_link_id="payLinkId",
    mail_2="jo@example.com; ceo@example.com",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**pay_link_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**attachfile:** `typing.Optional[bool]` — When `true`, attaches a PDF version of invoice to the email.
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `typing.Optional[str]` — List of recipient email addresses. When there is more than one, separate them by a semicolon (;).
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">update_pay_link_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a payment link's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, NoteElement, LabelElement
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.update_pay_link_from_id(
    pay_link_id="332-c277b704-1301",
    notes=NoteElement(
        enabled=True,
        header="Additional Notes",
        order=0,
        placeholder="Enter any additional notes here",
        value="",
    ),
    payment_button=LabelElement(
        enabled=True,
        label="Pay Now",
        order=0,
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**pay_link_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**contact_us:** `typing.Optional[ContactElement]` — ContactUs section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**logo:** `typing.Optional[Element]` — Logo section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**message_before_paying:** `typing.Optional[LabelElement]` — Message section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**notes:** `typing.Optional[NoteElement]` — Notes section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**page:** `typing.Optional[PageElement]` — Page header section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**payment_button:** `typing.Optional[LabelElement]` — Payment button section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**payment_methods:** `typing.Optional[MethodElement]` — Payment methods section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**review:** `typing.Optional[HeaderElement]` — Review section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**settings:** `typing.Optional[PagelinkSetting]` — Settings section of payment link page
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">add_pay_link_from_bill_lot_number</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a vendor payment link for a specific bill lot number. This allows you to pay all bills with the same lot number for a vendor with a single payment link.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ContactElement, Element, LabelElement, NoteElement, PageElement, HeaderElement, PagelinkSetting
from seed.environment import SeedApiEnvironment
from seed.money_out_types import MethodElementOut, MethodsListOut

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.add_pay_link_from_bill_lot_number(
    lot_number="LOT-2024-001",
    entry_point="billing",
    vendor_number="VENDOR-123",
    mail_2="customer@example.com; billing@example.com",
    amount_fixed="true",
    contact_us=ContactElement(
        email_label="Email",
        enabled=True,
        header="Contact Us",
        order=0,
        payment_icons=True,
        phone_label="Phone",
    ),
    logo=Element(
        enabled=True,
        order=0,
    ),
    message_before_paying=LabelElement(
        enabled=True,
        label="Please review your payment details",
        order=0,
    ),
    notes=NoteElement(
        enabled=True,
        header="Additional Notes",
        order=0,
        placeholder="Enter any additional notes here",
        value="",
    ),
    page=PageElement(
        description="Get paid securely",
        enabled=True,
        header="Payment Page",
        order=0,
    ),
    payment_button=LabelElement(
        enabled=True,
        label="Pay Now",
        order=0,
    ),
    payment_methods=MethodElementOut(
        all_methods_checked=True,
        allow_multiple_methods=True,
        default_method="vcard",
        enabled=True,
        header="Payment Methods",
        methods=MethodsListOut(
            ach=True,
            check=True,
            vcard=True,
        ),
        order=0,
        show_preview_virtual_card=True,
    ),
    review=HeaderElement(
        enabled=True,
        header="Review Payment",
        order=0,
    ),
    settings=PagelinkSetting(
        color="#000000",
        language="en",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**lot_number:** `str` — Lot number of the bills to pay. All bills with this lot number will be included.
    
</dd>
</dl>

<dl>
<dd>

**entry_point:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**vendor_number:** `str` — The vendor number for the vendor being paid with this payment link.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PaymentPageRequestBodyOut` 
    
</dd>
</dl>

<dl>
<dd>

**mail_2:** `typing.Optional[str]` — List of recipient email addresses. When there is more than one, separate them by a semicolon (;).
    
</dd>
</dl>

<dl>
<dd>

**amount_fixed:** `typing.Optional[str]` — Indicates whether customer can modify the payment amount. A value of `true` means the amount isn't modifiable, a value `false` means the payor can modify the amount to pay.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">patch_out_payment_link</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Partially updates a Pay Out payment link's content, expiration date, and/or status. Use this to modify the payment page configuration, extend or change the expiration, or cancel a link. Updating the expiration date of an expired link reactivates it to Active status.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.patch_out_payment_link(
    paylink_id="2325-XXXXXXX-90b1-4598-b6c7-44cdcbf495d7-1234",
    expiration_date="2026-06-01T00:00:00Z",
    status="Active",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**paylink_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PatchOutPaymentLinkRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_link.<a href="src/seed/payment_link/client.py">update_pay_link_out_from_id</a>(...) -> PayabliApiResponsePaymentLinks</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates the payment page content for a Pay Out payment link. Use this to change the branding, messaging, payment methods offered, or other page configuration.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, ContactElement, Element, LabelElement, NoteElement, PageElement, HeaderElement, PagelinkSetting
from seed.environment import SeedApiEnvironment
from seed.money_out_types import MethodElementOut, MethodsListOut

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_link.update_pay_link_out_from_id(
    paylink_id="2325-XXXXXXX-90b1-4598-b6c7-44cdcbf495d7-1234",
    contact_us=ContactElement(
        email_label="Email",
        enabled=True,
        header="Contact Us",
        order=0,
        payment_icons=True,
        phone_label="Phone",
    ),
    logo=Element(
        enabled=True,
        order=0,
    ),
    message_before_paying=LabelElement(
        enabled=True,
        label="Please review your payment details",
        order=0,
    ),
    notes=NoteElement(
        enabled=True,
        header="Additional Notes",
        order=0,
        placeholder="Enter any additional notes here",
        value="",
    ),
    page=PageElement(
        description="Get paid securely",
        enabled=True,
        header="Payment Page",
        order=0,
    ),
    payment_button=LabelElement(
        enabled=True,
        label="Pay Now",
        order=0,
    ),
    payment_methods=MethodElementOut(
        all_methods_checked=True,
        allow_multiple_methods=True,
        default_method="vcard",
        enabled=True,
        header="Payment Methods",
        methods=MethodsListOut(
            ach=True,
            check=True,
            vcard=True,
        ),
        order=0,
        show_preview_virtual_card=True,
    ),
    review=HeaderElement(
        enabled=True,
        header="Review Payment",
        order=0,
    ),
    settings=PagelinkSetting(
        color="#000000",
        language="en",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**paylink_id:** `str` — ID for the payment link.
    
</dd>
</dl>

<dl>
<dd>

**request:** `PaymentPageRequestBodyOut` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PaymentMethodDomain
<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">add_payment_method_domain</a>(...) -> AddPaymentMethodDomainApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Add a payment method domain to an organization or paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.payment_method_domain import AddPaymentMethodDomainRequestApplePay, AddPaymentMethodDomainRequestGooglePay

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.add_payment_method_domain(
    domain_name="checkout.example.com",
    entity_id=109,
    entity_type="paypoint",
    apple_pay=AddPaymentMethodDomainRequestApplePay(
        is_enabled=True,
    ),
    google_pay=AddPaymentMethodDomainRequestGooglePay(
        is_enabled=True,
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**apple_pay:** `typing.Optional[AddPaymentMethodDomainRequestApplePay]` — Apple Pay configuration information.
    
</dd>
</dl>

<dl>
<dd>

**google_pay:** `typing.Optional[AddPaymentMethodDomainRequestGooglePay]` — Google Pay configuration information.
    
</dd>
</dl>

<dl>
<dd>

**domain_name:** `typing.Optional[DomainName]` 
    
</dd>
</dl>

<dl>
<dd>

**entity_id:** `typing.Optional[EntityId]` 
    
</dd>
</dl>

<dl>
<dd>

**entity_type:** `typing.Optional[EntityType]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">cascade_payment_method_domain</a>(...) -> PaymentMethodDomainGeneralResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Cascades a payment method domain to all child entities. All paypoints and suborganization under this parent will inherit this domain and its settings.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.cascade_payment_method_domain(
    domain_id="pmd_b8237fa45c964d8a9ef27160cd42b8c5",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**domain_id:** `str` — The payment method domain's ID in Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">delete_payment_method_domain</a>(...) -> DeletePaymentMethodDomainResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a payment method domain. You can't delete an inherited domain, you must delete a domain at the organization level.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.delete_payment_method_domain(
    domain_id="pmd_b8237fa45c964d8a9ef27160cd42b8c5",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**domain_id:** `str` — The payment method domain's ID in Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">get_payment_method_domain</a>(...) -> PaymentMethodDomainApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get the details for a payment method domain.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.get_payment_method_domain(
    domain_id="pmd_b8237fa45c964d8a9ef27160cd42b8c5",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**domain_id:** `str` — The payment method domain's ID in Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">list_payment_method_domains</a>(...) -> ListPaymentMethodDomainsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get a list of payment method domains that belong to a PSP, organization, or paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.list_payment_method_domains(
    entity_id=1147,
    entity_type="paypoint",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entity_id:** `typing.Optional[int]` 

Identifier for the organization or paypoint. 
- For organization, provide the organization ID - For paypoint, provide the paypoint ID
    
</dd>
</dl>

<dl>
<dd>

**entity_type:** `typing.Optional[str]` 

The type of entity. Valid values: 
  - organization
  - paypoint
  - psp
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — Number of records to skip. Defaults to `0`.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records for query response. Defaults to `20`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">update_payment_method_domain</a>(...) -> PaymentMethodDomainGeneralResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Update a payment method domain's configuration values.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.payment_method_domain import UpdatePaymentMethodDomainRequestWallet

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.update_payment_method_domain(
    domain_id="pmd_b8237fa45c964d8a9ef27160cd42b8c5",
    apple_pay=UpdatePaymentMethodDomainRequestWallet(
        is_enabled=False,
    ),
    google_pay=UpdatePaymentMethodDomainRequestWallet(
        is_enabled=False,
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**domain_id:** `str` — The payment method domain's ID in Payabli.
    
</dd>
</dl>

<dl>
<dd>

**apple_pay:** `typing.Optional[UpdatePaymentMethodDomainRequestWallet]` 
    
</dd>
</dl>

<dl>
<dd>

**google_pay:** `typing.Optional[UpdatePaymentMethodDomainRequestWallet]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payment_method_domain.<a href="src/seed/payment_method_domain/client.py">verify_payment_method_domain</a>(...) -> PaymentMethodDomainGeneralResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Verify a new payment method domain. If verification is successful, Apple Pay is automatically activated for the domain.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payment_method_domain.verify_payment_method_domain(
    domain_id="pmd_b8237fa45c964d8a9ef27160cd42b8c5",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**domain_id:** `str` — The payment method domain's ID in Payabli.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## PayoutSubscription
<details><summary><code>client.payout_subscription.<a href="src/seed/payout_subscription/client.py">create_payout_subscription</a>(...) -> AddPayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a payout subscription to automatically send payouts to a vendor on a recurring schedule. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for a step-by-step guide.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, BillPayOutDataRequest
from seed.environment import SeedApiEnvironment
from seed.money_out_types import AuthorizePaymentMethod, RequestOutAuthorizeVendorData
from seed.payout_subscription import PayoutPaymentDetail, PayoutScheduleDetail
import datetime

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payout_subscription.create_payout_subscription(
    entry_point="d193cf9a46",
    payment_method=AuthorizePaymentMethod(
        method="ach",
        ach_holder="Herman Coatings",
        ach_routing="021000021",
        ach_account="3453445666",
        ach_account_type="checking",
    ),
    payment_details=PayoutPaymentDetail(
        total_amount=500,
        service_fee=0,
        currency="USD",
    ),
    vendor_data=RequestOutAuthorizeVendorData(
        vendor_id=1501,
    ),
    bill_data=[
        BillPayOutDataRequest(
            invoice_number="INV-5001",
            net_amount="500",
            invoice_date=datetime.date.fromisoformat("2025-08-01"),
            due_date=datetime.date.fromisoformat("2025-08-15"),
        )
    ],
    schedule_details=PayoutScheduleDetail(
        start_date="09/01/2025",
        end_date="09/01/2026",
        frequency="monthly",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `PayoutSubscriptionRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payout_subscription.<a href="src/seed/payout_subscription/client.py">get_payout_subscription</a>(...) -> GetPayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a single payout subscription's details. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payout_subscription.get_payout_subscription(
    id=42,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — The payout subscription ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payout_subscription.<a href="src/seed/payout_subscription/client.py">update_payout_subscription</a>(...) -> UpdatePayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a payout subscription's details. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payout_subscription.update_payout_subscription(
    id=42,
    set_pause=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — The payout subscription ID.
    
</dd>
</dl>

<dl>
<dd>

**request:** `UpdatePayoutSubscriptionBody` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.payout_subscription.<a href="src/seed/payout_subscription/client.py">delete_payout_subscription</a>(...) -> DeletePayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a payout subscription and prevents future payouts. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.payout_subscription.delete_payout_subscription(
    id=42,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id:** `int` — The payout subscription ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Paypoint
<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">get_basic_entry</a>(...) -> GetBasicEntryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets the basic details for a paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.get_basic_entry(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">get_basic_entry_by_id</a>(...) -> GetBasicEntryByIdResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the basic details for a paypoint by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.get_basic_entry_by_id(
    id_paypoint="198",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_paypoint:** `str` — Paypoint ID. You can find this value by querying `/api/Query/paypoints/{orgId}`
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">get_entry_config</a>(...) -> GetEntryConfigResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets the details for a single paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.get_entry_config(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**entrypages:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">get_page</a>(...) -> PayabliPages</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Gets the details for single payment page for a paypoint. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.get_page(
    entry="8cfec329267",
    subdomain="pay-your-fees-1",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**subdomain:** `str` — Payment page identifier. The subdomain value is the last portion of the payment page URL. For example, in`https://paypages-sandbox.payabli.com/513823dc10/pay-your-fees-1`, the subdomain is `pay-your-fees-1`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">remove_page</a>(...) -> PayabliApiResponseGeneric2Part</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a payment page in a paypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.remove_page(
    entry="8cfec329267",
    subdomain="pay-your-fees-1",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**subdomain:** `str` — Payment page identifier. The subdomain value is the last portion of the payment page URL. For example, in`https://paypages-sandbox.payabli.com/513823dc10/pay-your-fees-1`, the subdomain is `pay-your-fees-1`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">save_logo</a>(...) -> PayabliApiResponse00Responsedatanonobject</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a paypoint logo. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.save_logo(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request:** `FileContent` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">settings_page</a>(...) -> SettingsQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves an paypoint's basic settings like custom fields, identifiers, and invoicing settings.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.settings_page(
    entry="8cfec329267",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.paypoint.<a href="src/seed/paypoint/client.py">migrate</a>(...) -> MigratePaypointResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Migrates a paypoint to a new parent organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment
from seed.paypoint import NotificationRequest, WebHeaderParameter

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.paypoint.migrate(
    entry_point="473abc123def",
    new_parent_organization_id=123,
    notification_request=NotificationRequest(
        notification_url="https://webhook-test.yoursie.com",
        web_header_parameters=[
            WebHeaderParameter(
                key="testheader",
                value="1234567890",
            )
        ],
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `PaypointMoveRequest` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Query
<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batch_details</a>(...) -> QueryBatchesDetailResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of batches and their details, including settled and
unsettled transactions for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batch_details(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `settlementDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `gatewayTransId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `settledAmount`  (gt, ge, lt, le, eq, ne)
- `operation`    (in, nin, eq, ne)
- `source`   (in, nin, eq, ne)
- `batchNumber`  (ct, nct, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `isHold` (eq, ne)
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `batchId` (ct, nct, eq, neq)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**

- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batch_details_org</a>(...) -> QueryResponseSettlements</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of batches and their details, including settled and unsettled transactions for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batch_details_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `settlementDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `gatewayTransId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `settledAmount`  (gt, ge, lt, le, eq, ne)
- `operation`    (in, nin, eq, ne)
- `source`   (in, nin, eq, ne)
- `batchNumber`  (ct, nct, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `isHold` (eq, ne)
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `batchId` (ct, nct, eq, neq)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**

- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batches</a>(...) -> QueryBatchesResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of batches for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batches(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `method` (in, nin, eq, ne)
- `connectorName` (ne, eq, ct, nct)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `feeBatchAmount` (gt, ge, lt, le, eq, ne)
- `netBatchAmount` (gt, ge, lt, le, eq, ne)
- `releaseAmount` (gt, ge, lt, le, eq, ne)
- `heldAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
- `expectedDepositDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `batchRecords` (gt, ge, lt, le, eq, ne)
- `transferId` (ne, eq)
- `transferDate` (gt, ge, lt, le, eq, ne)
- `grossAmount` (gt, ge, lt, le, eq, ne)
- `chargeBackAmount` (gt, ge, lt, le, eq, ne)
- `returnedAmount` (gt, ge, lt, le, eq, ne)
- `billingFeeAmount` (gt, ge, lt, le, eq, ne)
- `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
- `netFundedAmount` (gt, ge, lt, le, eq, ne)
- `adjustmentAmount` (gt, ge, lt, le, eq, ne)
- `processor` (ne, eq, ct, nct)
- `transferStatus` (ne, eq, in, nin)

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batches_org</a>(...) -> QueryBatchesResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of batches for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batches_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `method` (in, nin, eq, ne)
- `connectorName` (ne, eq, ct, nct)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `feeBatchAmount` (gt, ge, lt, le, eq, ne)
- `netBatchAmount` (gt, ge, lt, le, eq, ne)
- `releaseAmount` (gt, ge, lt, le, eq, ne)
- `heldAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
- `expectedDepositDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `batchRecords` (gt, ge, lt, le, eq, ne)
- `transferId` (ne, eq)
- `transferDate` (gt, ge, lt, le, eq, ne)
- `grossAmount` (gt, ge, lt, le, eq, ne)
- `chargeBackAmount` (gt, ge, lt, le, eq, ne)
- `returnedAmount` (gt, ge, lt, le, eq, ne)
- `billingFeeAmount` (gt, ge, lt, le, eq, ne)
- `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
- `netFundedAmount` (gt, ge, lt, le, eq, ne)
- `adjustmentAmount` (gt, ge, lt, le, eq, ne)
- `processor` (ne, eq, ct, nct)
- `transferStatus` (ne, eq, in, nin)

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `batchAmount(gt)=20` returns all records with a `batchAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batches_out</a>(...) -> QueryBatchesOutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of MoneyOut batches for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batches_out(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted**:

- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `parentOrgId` (ne, eq, nin, in)
- `status` (in, nin, eq, ne)
- `orgId` (eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_batches_out_org</a>(...) -> QueryBatchesOutResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of MoneyOut batches for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_batches_out_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted**:

- `batchDate` (gt, ge, lt, le, eq, ne)
- `batchNumber` (ne, eq)
- `batchAmount` (gt, ge, lt, le, eq, ne)
- `parentOrgId` (ne, eq, nin, in)
- `status` (in, nin, eq, ne)
- `orgId` (eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `paypointId` (ne, eq)
- `externalPaypointID` (ct, nct, eq, ne)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_chargebacks</a>(...) -> QueryChargebacksResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of chargebacks and returned transactions for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_chargebacks(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**
- `chargebackDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `netAmount`  (gt, ge, lt, le, eq, ne)
- `reasonCode`   (in, nin, eq, ne)
- `reason`  (ct, nct, eq, ne)
- `replyDate` (gt, ge, lt, le, eq, ne)
- `caseNumber`  (ct, nct, eq, ne)
- `status`   (in, nin, eq, ne)
- `accountType`   (in, nin, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted - enclosed between parentheses:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_chargebacks_org</a>(...) -> QueryChargebacksResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of chargebacks and returned transactions for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_chargebacks_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info> See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**

- `chargebackDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `netAmount`  (gt, ge, lt, le, eq, ne)
- `reasonCode`   (in, nin, eq, ne)
- `reason`  (ct, nct, eq, ne)
- `replyDate` (gt, ge, lt, le, eq, ne)
- `caseNumber`  (ct, nct, eq, ne)
- `status`   (in, nin, eq, ne)
- `accountType`   (in, nin, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted - enclosed between parentheses:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_customers</a>(...) -> QueryCustomerResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of customers for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_customers(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more details.

**List of Accepted Field Names:**

- `createdDate` (gt, ge, lt, le, eq, ne)
- `customernumber` (ne, eq, ct, nct)
- `firstname` (ne, eq, ct, nct)
- `lastname` (ne, eq, ct, nct)
- `name` (ct, nct)
- `address` (ne, eq, ct, nct)
- `city` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `shippingaddress` (ne, eq, ct, nct)
- `shippingcity` (ne, eq, ct, nct)
- `shippingcountry` (ne, eq, ct, nct)
- `shippingzip` (ne, eq, ct, nct)
- `shippingstate` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `company` (ne, eq, ct, nct)
- `username` (ne, eq, ct, nct)
- `balance` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

**List of Accepted Comparisons:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**Accepted Parameters:**
- `limitRecord`: Max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: Initial record in query

**Example Usage:**
`balance(gt)=20` will return all records with a balance greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_customers_org</a>(...) -> QueryCustomerResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of customers for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_customers_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more details.

**List of Accepted Field Names:**

- `createdDate` (gt, ge, lt, le, eq, ne)
- `customernumber` (ne, eq, ct, nct)
- `firstname` (ne, eq, ct, nct)
- `lastname` (ne, eq, ct, nct)
- `name` (ct, nct)
- `address` (ne, eq, ct, nct)
- `city` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `shippingaddress` (ne, eq, ct, nct)
- `shippingcity` (ne, eq, ct, nct)
- `shippingcountry` (ne, eq, ct, nct)
- `shippingzip` (ne, eq, ct, nct)
- `shippingstate` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `company` (ne, eq, ct, nct)
- `username` (ne, eq, ct, nct)
- `balance` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name
- `orgId` (eq) *mandatory when entry=org*
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

**List of Accepted Comparisons:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**Accepted Parameters:**
- `limitRecord`: Max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: Initial record in query

**Example Usage:**
`balance(gt)=20` will return all records with a balance greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_notification_reports</a>(...) -> QueryResponseNotificationReports</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of all reports generated in the last 60 days for a single entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_notification_reports(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `reportName` (ct, nct, eq, ne)
- `createdAt` (gt, ge, lt, le, eq, ne)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: reportName(ct)=tr  return all records containing the string "tr"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_notification_reports_org</a>(...) -> QueryResponseNotificationReports</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of all reports generated in the last 60 days for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_notification_reports_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query <Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `reportName` (ct, nct, eq, ne)
- `createdAt` (gt, ge, lt, le, eq, ne)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: reportName(ct)=tr  return all records containing the string "tr"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_notifications</a>(...) -> QueryResponseNotifications</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of notifications for an entrypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_notifications(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `frequency` (in, nin,ne, eq)
- `method` (in, nin, eq, ne)
- `event` (in, nin, eq, ne)
- `target` (ct, nct, eq, ne)
- `status` (eq, ne)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20  return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_notifications_org</a>(...) -> QueryResponseNotifications</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Return a list of notifications for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_notifications_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `frequency` (in, nin,ne, eq)
- `method` (in, nin, eq, ne)
- `event` (in, nin, eq, ne)
- `target` (ct, nct, eq, ne)
- `status` (eq, ne)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: totalAmount(gt)=20  return all records with totalAmount greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_organizations</a>(...) -> ListOrganizationsResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of an organization's suborganizations and their full details such as orgId, users, and settings. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_organizations(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
**List of field names accepted:**

- `createdAt` (gt, ge, lt, le, eq, ne)
- `startDate` (gt, ge, lt, le, eq, ne)
- `dbaname`  (ct, nct)
- `legalname`  (ct, nct)
- `ein`  (ct, nct)
- `address`  (ct, nct)
- `city`  (ct, nct)
- `state`  (ct, nct)
- `phone`  (ct, nct)
- `mcc`  (ct, nct)
- `owntype`  (ct, nct)
- `ownerName`  (ct, nct)
- `contactName`  (ct, nct)
- `orgParentname`  (ct, nct)
- `boardingId` (eq, ne) 
- `entryName`  (ct, nct)

**List of comparison accepted - enclosed between parentheses:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array

**List of parameters accepted:**

- `limitRecord` : max number of records for query (default="20", "0" or negative value for all)
- `fromRecord` : initial record in query

Example: `dbaname(ct)=hoa` returns all records with a `dbaname` containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_payout</a>(...) -> QueryPayoutTransaction</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of money out transactions (payouts) for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_payout(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

List of field names accepted:

  - `status` (in, nin, eq, ne)
  - `transactionDate` (gt, ge, lt, le, eq, ne)
  - `billNumber` (ct, nct)
  - `vendorNumber` (ct, nct, eq, ne)
  - `vendorName` (ct, nct, eq, ne)
  - `paymentMethod` (ct, nct, eq, ne, in, nin)
  - `paymentId` (ct, nct, eq, ne)
  - `parentOrgId` (ne, eq, nin, in)
  - `batchNumber` (ct, nct, eq, ne)
  - `totalAmount` (gt, ge, lt, le, eq, ne)
  - `paypointLegal` (ne, eq, ct, nct)
  - `paypointDba` (ne, eq, ct, nct)
  - `accountId` (ne, eq, ct, nct)
  - `orgName` (ne, eq, ct, nct)
  - `externalPaypointID` (ct, nct, eq, ne)
  - `paypointId` (eq, ne)
  - `vendorId` (eq, ne)
  - `vendorEIN` (ct, nct, eq, ne)
  - `vendorPhone` (ct, nct, eq, ne)
  - `vendorEmail` (ct, nct, eq, ne)
  - `vendorAddress` (ct, nct, eq, ne)
  - `vendorCity` (ct, nct, eq, ne)
  - `vendorState` (ct, nct, eq, ne)
  - `vendorCountry` (ct, nct, eq, ne)
  - `vendorZip` (ct, nct, eq, ne)
  - `vendorMCC` (ct, nct, eq, ne)
  - `vendorLocationCode` (ct, nct, eq, ne)
  - `vendorCustomField1` (ct, nct, eq, ne)
  - `vendorCustomField2` (ct, nct, eq, ne)
  - `comments` (ct, nct)
  - `payaccountCurrency` (ne, eq, in, nin)
  - `remitAddress` (ct, nct)
  - `source` (ct, nct, eq, ne)
  - `updatedOn` (gt, ge, lt, le, eq, ne)
  - `feeAmount` (gt, ge, lt, le, eq, ne)
  - `lotNumber` (ct, nct)
  - `customerVendorAccount` (ct, nct, eq, ne)
  - `batchId` (eq, ne)
  - `AchTraceNumber` (eq, ne)
  - `payoutProgram`(eq, ne) the options are `managed` or `odp`. For example, `payoutProgram(eq)=managed` returns all records with a `payoutProgram` equal to `managed`. 

  List of comparison accepted - enclosed between parentheses:
  - eq or empty => equal
  - gt => greater than
  - ge => greater or equal
  - lt => less than
  - le => less or equal
  - ne => not equal
  - ct => contains
  - nct => not contains
  - in => inside array separated by \"|\"
  - nin => not inside array separated by \"|\"

  List of parameters accepted:

  - limitRecord : max number of records for query (default=\"20\", \"0\" or negative value for all)
  - fromRecord : initial record in query
  - sortBy : indicate field name and direction to sort the results

  Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00

  Example: `sortBy=desc(netamount)` returns all records sorted by `netAmount` descending
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_payout_org</a>(...) -> QueryPayoutTransaction</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of money out transactions (payouts) for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_payout_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:
  
  - `status` (in, nin, eq, ne)
  - `transactionDate` (gt, ge, lt, le, eq, ne)
  - `billNumber` (ct, nct)
  - `vendorNumber` (ct, nct, eq, ne)
  - `vendorName` (ct, nct, eq, ne)
  - `parentOrgId` (ne, eq, nin, in)
  - `paymentMethod` (ct, nct, eq, ne, in, nin)
  - `paymentId` (ct, nct, eq, ne)
  - `batchNumber` (ct, nct, eq, ne)
  - `totalAmount` (gt, ge, lt, le, eq, ne)
  - `paypointLegal` (ne, eq, ct, nct)
  - `paypointDba` (ne, eq, ct, nct)
  - `accountId` (ne, eq, ct, nct)
  - `orgName` (ne, eq, ct, nct)
  - `externalPaypointID` (ct, nct, eq, ne)
  - `paypointId` (eq, ne)
  - `vendorId` (eq, ne)
  - `vendorEIN` (ct, nct, eq, ne)
  - `vendorPhone` (ct, nct, eq, ne)
  - `vendorEmail` (ct, nct, eq, ne)
  - `vendorAddress` (ct, nct, eq, ne)
  - `vendorCity` (ct, nct, eq, ne)
  - `vendorState` (ct, nct, eq, ne)
  - `vendorCountry` (ct, nct, eq, ne)
  - `vendorZip` (ct, nct, eq, ne)
  - `vendorMCC` (ct, nct, eq, ne)
  - `vendorLocationCode` (ct, nct, eq, ne)
  - `vendorCustomField1` (ct, nct, eq, ne)
  - `vendorCustomField2` (ct, nct, eq, ne)
  - `comments` (ct, nct)
  - `payaccountCurrency` (ne, eq, in, nin)
  - `remitAddress` (ct, nct)
  - `source` (ct, nct, eq, ne)
  - `updatedOn` (gt, ge, lt, le, eq, ne)
  - `feeAmount` (gt, ge, lt, le, eq, ne)
  - `lotNumber` (ct, nct)
  - `customerVendorAccount` (ct, nct, eq, ne)
  - `batchId` (eq, ne)
  - `AchTraceNumber` (eq, ne)
  - `payoutProgram`(eq, ne) the options are `managed` or `odp`. For example, `payoutProgram(eq)=managed` returns all records with a `payoutProgram` equal to `managed`.

  List of comparison accepted - enclosed between parentheses:
  - eq or empty => equal
  - gt => greater than
  - ge => greater or equal
  - lt => less than
  - le => less or equal
  - ne => not equal
  - ct => contains
  - nct => not contains
  - in => inside array separated by \"|\"
  - nin => not inside array separated by \"|\"

  List of parameters accepted:

  - limitRecord : max number of records for query (default=\"20\", \"0\" or negative value for all)
  - fromRecord : initial record in query
  - sortBy : indicate field name and direction to sort the results

  Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00

  Example: `sortBy=desc(netamount)` returns all records sorted by `netAmount` descending
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_paypoints</a>(...) -> QueryEntrypointResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of paypoints in an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_paypoints(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
**List of field names accepted:**

- `createdAt` (gt, ge, lt, le, eq, ne)
- `lastModified` (gt, ge, lt, le, eq, ne)
- `startDate` (gt, ge, lt, le, eq, ne)
- `dbaname`  (ct, nct)
- `status` (eq, ne)
- `legalname`  (ct, nct)
- `externalPaypointID` (ct, nct)
- `ein`  (ct, nct)
- `address`  (ct, nct)
- `city`  (ct, nct)
- `state`  (ct, nct)
- `phone`  (ct, nct)
- `mcc`  (ct, nct)
- `owntype`  (ct, nct)
- `ownerName`  (ct, nct)
- `contactName`  (ct, nct)
- `paypointId` (eq, ne)
- `orgParentname`  (ct, nct, in, nin)
- `boardingId` (eq, ne) 
- `entryName`  (ct, nct)
- `externalOrgID` (ct, nct)

**List of comparison accepted - enclosed between parentheses:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array

**List of parameters accepted:**

- `limitRecord` : max number of records for query (default="20", "0" or negative value for all)
- `fromRecord` : initial record in query

Example: `dbaname(ct)=hoa` returns all records with a `dbaname` containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_settlements</a>(...) -> QueryResponseSettlements</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of settled transactions for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_settlements(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `settlementDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `gatewayTransId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `settledAmount`  (gt, ge, lt, le, eq, ne)
- `operation`    (in, nin, eq, ne)
- `source`   (in, nin, eq, ne)
- `batchNumber`  (ct, nct, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `isHold` (eq, ne)
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `batchId` (ct, nct, eq, neq)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**

- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_settlements_org</a>(...) -> QueryResponseSettlements</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of settled transactions for an organization. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_settlements_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `settlementDate` (gt, ge, lt, le, eq, ne)
- `depositDate` (gt, ge, lt, le, eq, ne)
- `transId`  (ne, eq, ct, nct)
- `gatewayTransId`  (ne, eq, ct, nct)
- `method`   (in, nin, eq, ne)
- `settledAmount`  (gt, ge, lt, le, eq, ne)
- `operation`    (in, nin, eq, ne)
- `source`   (in, nin, eq, ne)
- `batchNumber`  (ct, nct, eq, ne)
- `payaccountLastfour`   (nct, ct)
- `payaccountType`   (ne, eq, in, nin)
- `customerFirstname`   (ct, nct, eq, ne)
- `customerLastname`    (ct, nct, eq, ne)
- `customerName`   (ct, nct)
- `customerId`  (eq, ne)
- `customerNumber`  (ct, nct, eq, ne)
- `customerCompanyname`    (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity`    (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity`    (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId`  (eq) *mandatory when entry=org*
- `isHold` (eq, ne)
- `paypointId`  (ne, eq)
- `paypointLegal`  (ne, eq, ct, nct)
- `paypointDba`  (ne, eq, ct, nct)
- `orgName`  (ne, eq, ct, nct)
- `batchId` (ct, nct, eq, neq)
- `additional-xxx`  (ne, eq, ct, nct) where xxx is the additional field name

**List of comparison accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**

- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `settledAmount(gt)=20` returns all records with a `settledAmount` greater than 20.00.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_subscriptions</a>(...) -> QuerySubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of subscriptions for a single paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_subscriptions(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
      
**List of field names accepted:**

- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `externalPaypointId` (ct, nct, ne, eq)
- `subId` (eq, ne)
- `orderDescription` (ct, nct)
- `cycles` (eq, ne, gt, ge, lt, le)
- `leftcycles` (eq, ne, gt, ge, lt, le)
- `createdAt` (eq, ne, gt, ge, lt, le)
- `updatedOn` (eq, ne, gt, ge, lt, le)
- `invoiceNumber` (ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name  

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_subscriptions_org</a>(...) -> QuerySubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of subscriptions for a single org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_subscriptions_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
      
**List of field names accepted:**

- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `orgId` (eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `externalPaypointId` (ct, nct, ne, eq)
- `subId` (eq, ne)
- `orderDescription` (ct, nct)
- `cycles` (eq, ne, gt, ge, lt, le)
- `leftcycles` (eq, ne, gt, ge, lt, le)
- `createdAt` (eq, ne, gt, ge, lt, le)
- `updatedOn` (eq, ne, gt, ge, lt, le)
- `invoiceNumber` (ct, nct)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name  

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_payout_subscriptions</a>(...) -> QueryPayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of payout subscriptions for a single paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_payout_subscriptions(
    entry="8cfec329267",
    from_record=0,
    limit_record=20,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/payoutsubscriptions/entry123?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/payoutsubscriptions/entry123?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
**List of field names accepted:**

- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (ct, nct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct, nin, in)
- `parentOrgId` (ne, eq, nin, in)
- `subscriptionId` (eq, ne)
- `orderDescription` (ct, nct)
- `cycles` (eq, ne, gt, ge, lt, le)
- `leftcycles` (eq, ne, gt, ge, lt, le)
- `createdAt` (eq, ne, gt, ge, lt, le)
- `updatedOn` (eq, ne, gt, ge, lt, le)
- `vendorNumber` (ne, eq, ct, nct)
- `name` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `address` (ne, eq, ct, nct)
- `remitAddress` (ct, nct)
- `city` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_payout_subscriptions_org</a>(...) -> QueryPayoutSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Returns a list of payout subscriptions for a single org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response. See [Manage payout subscriptions](/guides/pay-out-developer-payout-subscriptions-manage) for more information.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_payout_subscriptions_org(
    org_id=123,
    from_record=0,
    limit_record=20,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/payoutsubscriptions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/payoutsubscriptions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
**List of field names accepted:**

- `startDate` (gt, ge, lt, le, eq, ne)
- `endDate` (gt, ge, lt, le, eq, ne)
- `nextDate` (gt, ge, lt, le, eq, ne)
- `frequency` (in, nin, ne, eq)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `status` (in, nin, eq, ne)
- `untilcancelled` (eq, ne)
- `payaccountLastfour` (ct, nct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct, nin, in)
- `parentOrgId` (ne, eq, nin, in)
- `subscriptionId` (eq, ne)
- `orderDescription` (ct, nct)
- `cycles` (eq, ne, gt, ge, lt, le)
- `leftcycles` (eq, ne, gt, ge, lt, le)
- `createdAt` (eq, ne, gt, ge, lt, le)
- `updatedOn` (eq, ne, gt, ge, lt, le)
- `vendorNumber` (ne, eq, ct, nct)
- `name` (ne, eq, ct, nct)
- `phone` (ne, eq, ct, nct)
- `email` (ne, eq, ct, nct)
- `address` (ne, eq, ct, nct)
- `remitAddress` (ct, nct)
- `city` (ne, eq, ct, nct)
- `state` (ne, eq, ct, nct)
- `country` (ne, eq, ct, nct)
- `zip` (ne, eq, ct, nct)

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transactions</a>(...) -> QueryResponseTransactions</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of transactions for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
By default, this endpoint returns only transactions from the last 60 days. To query transactions outside of this period, include `transactionDate` filters.
For example, this request parameters filter for transactions between April 01, 2024 and April 09, 2024. 
``` curl -X GET https://sandbox.payabli.com/api/Query/transactions/org/1?limitRecord=20&fromRecord=0&transactionDate(ge)=2024-04-01T00:00:00&transactionDate(le)=2024-04-09T23:59:59\
  -H 'requestToken: <API TOKEN>'

  ```
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transactions(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `transactionDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct, in, nin)
- `gatewayTransId` (ne, eq, ct, nct)
- `orderId` (ne, eq)
- `scheduleId` (ne, eq)
- `returnId` (ne, eq)
- `refundId` (ne, eq)
- `idTrans` (ne, eq)
- `orgId` (ne, eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `externalPaypointId` (ct, nct, eq, ne)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne, ct, nct)
- `status` (in, nin, eq, ne)
- `settlementStatus` (in, nin, eq, ne)
- `batchNumber` (nct, ct)
- `invoiceNumber` (ct, nct)
- `ipAddress` (eq, ne)
- `authCode` (ct, nct)
- `orderDescription` (ct, nct)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `deviceId` (ct, nct, in, nin, eq, ne)
- `AchSecCode` ( ct, nct, in, nin, eq, ne)
- `AchHolderType` (ct, nct, in, nin, eq, and ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name related to customer data
- 'invoiceAdditional-xxx' (ne, eq, ct, nct) where xxx is the additional field name related to invoice data

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transactions_org</a>(...) -> QueryResponseTransactions</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>


Retrieve a list of transactions for an organization. Use filters to
limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.


By default, this endpoint returns only transactions from the last 60 days. To query transactions outside of this period, include `transactionDate` filters.

For example, this request parameters filter for transactions between April 01, 2024 and April 09, 2024. 

```
curl -X GET "https://sandbox.payabli.com/api/Query/transactions/org/1?limitRecord=20&fromRecord=0&transactionDate(ge)=2024-04-01T00:00:00&transactionDate(le)=2024-04-09T23:59:59"\
  -H 'requestToken: <API TOKEN>'

  ```
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transactions_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.

**List of field names accepted:**

- `transactionDate` (gt, ge, lt, le, eq, ne)
- `transId` (ne, eq, ct, nct, in, nin)
- `gatewayTransId` (ne, eq, ct, nct)
- `orderId` (ne, eq)
- `scheduleId` (ne, eq)
- `returnId` (ne, eq)
- `refundId` (ne, eq)
- `idTrans` (ne, eq)
- `orgId` (ne, eq)
- `paypointId` (ne, eq)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)
- `externalPaypointId` (ct, nct, eq, ne)
- `method` (in, nin, eq, ne)
- `totalAmount` (gt, ge, lt, le, eq, ne)
- `netAmount` (gt, ge, lt, le, eq, ne)
- `feeAmount` (gt, ge, lt, le, eq, ne)
- `operation` (in, nin, eq, ne)
- `source` (in, nin, eq, ne, ct, nct)
- `status` (in, nin, eq, ne)
- `settlementStatus` (in, nin, eq, ne)
- `batchNumber` (nct, ct)
- `invoiceNumber` (ct, nct)
- `authCode` (ct, nct)
- `orderDescription` (ct, nct)
- `payaccountLastfour` (nct, ct)
- `payaccountType` (ne, eq, in, nin)
- `payaccountCurrency` (ne, eq, in, nin)
- `customerFirstname` (ct, nct, eq, ne)
- `customerLastname` (ct, nct, eq, ne)
- `customerName` (ct, nct)
- `customerId` (eq, ne)
- `customerNumber` (ct, nct, eq, ne)
- `customerCompanyname` (ct, nct, eq, ne)
- `customerAddress` (ct, nct, eq, ne)
- `customerCity` (ct, nct, eq, ne)
- `customerZip` (ct, nct, eq, ne)
- `customerState` (ct, nct, eq, ne)
- `customerCountry` (ct, nct, eq, ne)
- `customerPhone` (ct, nct, eq, ne)
- `customerEmail` (ct, nct, eq, ne)
- `customerShippingAddress` (ct, nct, eq, ne)
- `customerShippingCity` (ct, nct, eq, ne)
- `customerShippingZip` (ct, nct, eq, ne)
- `customerShippingState` (ct, nct, eq, ne)
- `customerShippingCountry` (ct, nct, eq, ne)
- `deviceId` (ct, nct, in, nin, eq, ne)
- `AchSecCode` ( ct, nct, in, nin, eq, ne)
- `AchHolderType`` (ct, nct, in, nin, eq, and ne)
- `additional-xxx` (ne, eq, ct, nct) where xxx is the additional field name related to customer data
- 'invoiceAdditional-xxx' (ne, eq, ct, nct) where xxx is the additional field name related to invoice data

**List of comparison operators accepted:**
- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array
- `nin` => not inside array
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfer_details</a>(...) -> QueryTransferDetailResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of transfer details records for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfer_details(
    entry="47862acd",
    transfer_id=123456,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**transfer_id:** `int` — The numeric identifier for the transfer, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[LimitRecord]` 
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter
the query. 

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>

See [Filters and Conditions
Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference)
for more information.


**List of field names accepted:**

  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `chargeBackAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)
  - `splitFundingAmount` (gt, ge, lt, le, eq, ne)
  - `operation` (in, nin, eq, ne)
  - `transactionId` (eq, ne, in, nin)
  - `category` (eq, ne, ct, nct)
  - `type` (eq, ne, in, nin)
  - `method` (eq, ne, in, nin)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfers</a>(...) -> TransferQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of transfers for a paypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfers(
    entry="47862acd",
    from_record=0,
    limit_record=20,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:

  - `transferDate` (gt, ge, lt, le, eq, ne)
  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `chargeBackAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)
  - `processor` (ne, eq, ct, nct)
  - `transferStatus` (ne, eq, in, nin)
  - `batchNumber` (ne, eq, ct, nct)
  - `batchId` (ne, eq, in, nin)
  - `transferId` (in, nin, eq, ne)
  - `bankAccountNumber` (ct, nct, ne, eq)
  - `bankRoutingNumber` (ct, nct, ne, eq)
  - `batchCurrency` (in, nin, ne, eq)
  - `parentOrgName` (ct, nct, ne, eq)
  - `parentOrgId` (ct, nct, ne, eq)
  - `externalPaypointID` (ct, nct)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfers_org</a>(...) -> TransferQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of transfers for an org. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfers_org(
    org_id=123,
    from_record=0,
    limit_record=20,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `Orgid` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:

  - `transferDate` (gt, ge, lt, le, eq, ne)
  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `chargeBackAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `thirdPartyPaidAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)
  - `processor` (ne, eq, ct, nct)
  - `transferStatus` (ne, eq, in, nin)
  - `batchNumber` (ne, eq, ct, nct)
  - `batchId` (ne, eq, in, nin)
  - `transferId` (in, nin, eq, ne)
  - `bankAccountNumber` (ct, nct, ne, eq)
  - `bankRoutingNumber` (ct, nct, ne, eq)
  - `batchCurrency` (in, nin, ne, eq)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfers_out_org</a>(...) -> TransferOutQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of outbound transfers for an organization. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfers_out_org(
    org_id=77,
    from_record=0,
    limit_record=20,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:

  - `transferDate` (gt, ge, lt, le, eq, ne)
  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `processor` (ne, eq, ct, nct)
  - `transferStatus` (ne, eq, in, nin)
  - `transferId` (ne, eq, in, nin)
  - `paypointLegalName` (ne, eq, ct, nct)
  - `paypointDbaName` (ne, eq, ct, nct)
  - `batchNumber` (ne, eq, ct, nct)
  - `batchId` (ne, eq, in, nin)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfers_out_paypoint</a>(...) -> TransferOutQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of outbound transfers for a paypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfers_out_paypoint(
    entry="47cade237",
    from_record=0,
    limit_record=20,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:

  - `transferDate` (gt, ge, lt, le, eq, ne)
  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `processor` (ne, eq, ct, nct)
  - `transferStatus` (ne, eq, in, nin)
  - `transferId` (ne, eq, in, nin)
  - `paypointLegalName` (ne, eq, ct, nct)
  - `paypointDbaName` (ne, eq, ct, nct)
  - `batchNumber` (ne, eq, ct, nct)
  - `batchId` (ne, eq, in, nin)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_transfer_details_out</a>(...) -> TransferOutDetailQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve details for a specific outbound transfer. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_transfer_details_out(
    entry="47ace2b25",
    transfer_id=4521,
    from_record=0,
    limit_record=20,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**transfer_id:** `int` — The numeric identifier for the transfer, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for more information.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:

  - `grossAmount` (gt, ge, lt, le, eq, ne)
  - `returnedAmount` (gt, ge, lt, le, eq, ne)
  - `billingFeeAmount` (gt, ge, lt, le, eq, ne)
  - `netFundedAmount` (gt, ge, lt, le, eq, ne)
  - `adjustmentAmount` (gt, ge, lt, le, eq, ne)
  - `transactionId` (eq, ne, in, nin)
  - `category` (eq, ne, ct, nct)
  - `type` (eq, ne, in, nin)
  - `method` (eq, ne, in, nin)
  - `walletType` (eq, ne, in, nin)
  - `splitFundingAmount` (gt, ge, lt, le, eq, ne)
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_users_org</a>(...) -> QueryUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get list of users for an org. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_users_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**

- `createdDate` (gt, ge, lt, le, eq, ne)
- `name`  (ne, eq, ct, nct)
- `email`  (ne, eq, ct, nct)
- `status`   (in, nin, eq, ne)
- `role.xxx`  (ne, eq, ct, nct) where xxx is the role field: `roleLabel` or `roleValue`

**List of comparison accepted - enclosed between parentheses:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `name(ct)=john`  return all records with name containing 'john'.
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_users_paypoint</a>(...) -> QueryUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Get list of users for a paypoint. Use filters to limit results.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_users_paypoint(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query.
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

**List of field names accepted:**

- `createdDate` (gt, ge, lt, le, eq, ne)
- `name`  (ne, eq, ct, nct)
- `email`  (ne, eq, ct, nct)
- `status`   (in, nin, eq, ne)
- `role.xxx`  (ne, eq, ct, nct) where xxx is the role field: `roleLabel` or `roleValue`

**List of comparison accepted - enclosed between parentheses:**

- `eq` or empty => equal
- `gt` => greater than
- `ge` => greater or equal
- `lt` => less than
- `le` => less or equal
- `ne` => not equal
- `ct` => contains
- `nct` => not contains
- `in` => inside array separated by "|"
- `nin` => not inside array separated by "|"

**List of parameters accepted:**
- `limitRecord`: max number of records for query (default="20", "0" or negative value for all)
- `fromRecord`: initial record in query

Example: `name(ct)=john`  return all records with name containing 'john'
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_vendors</a>(...) -> QueryResponseVendors</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of vendors for an entrypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_vendors(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — The paypoint's entrypoint identifier. [Learn more](/developers/api-reference/api-overview#entrypoint-vs-entry)
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `method` (in, nin, eq, ne)
- `enrollmentStatus` (in,nin, eq, ne)
- `status` (in, nin, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `name` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `phone` (ct, nct, eq, ne)
- `email` (ct, nct, eq, ne)
- `address` (ct, nct, eq, ne)
- `city` (ct, nct, eq, ne)
- `state` (ct, nct, eq, ne)
- `country` (ct, nct, eq, ne)
- `zip` (ct, nct, eq, ne)
- `mcc` (ct, nct, eq, ne)
- `locationCode` (ct, nct, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `parentOrgId` (ne, eq, nin, in)
- `paypointDba` (ne, eq, ct, nct)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_vendors_org</a>(...) -> QueryResponseVendors</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of vendors for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_vendors_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `method` (in, nin, eq, ne)
- `enrollmentStatus` (in,nin, eq, ne)
- `status` (in, nin, eq, ne)
- `vendorNumber` (ct, nct, eq, ne)
- `name` (ct, nct, eq, ne)
- `ein` (ct, nct, eq, ne)
- `phone` (ct, nct, eq, ne)
- `email` (ct, nct, eq, ne)
- `address` (ct, nct, eq, ne)
- `city` (ct, nct, eq, ne)
- `state` (ct, nct, eq, ne)
- `country` (ct, nct, eq, ne)
- `zip` (ct, nct, eq, ne)
- `mcc` (ct, nct, eq, ne)
- `locationCode` (ct, nct, eq, ne)
- `paypointLegal` (ne, eq, ct, nct)
- `paypointDba` (ne, eq, ct, nct)
- `parentOrgId` (ne, eq, nin, in)
- `orgName` (ne, eq, ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array separated by "|"
- nin => not inside array separated by "|"

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: `netAmount(gt)=20` returns all records with a `netAmount` greater than 20.00
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_vcards</a>(...) -> VCardQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of vcards (virtual credit cards) issued for an entrypoint. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_vcards(
    entry="8cfec329267",
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `Entry` 
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:  

  - `status` (in, nin, eq, ne)  
  - `createdAt` (gt, ge, lt, le, eq, ne)  
  - `cardToken` (ct, nct, eq, ne)  
  - `lastFour` (ct, nct, eq, ne)  
  - `expirationDate` (ct, nct, eq, ne)  
  - `payoutId` (ct, nct, eq, ne, in, nin)  
  - `vendorId` (ct, nct, eq, ne, in, nin)  
  - `miscData1` (ct, nct, eq, ne)  
  - `miscData2` (ct, nct, eq, ne)  
  - `currentUses` (gt, ge, lt, le, eq, ne)  
  - `amount` (gt, ge, lt, le, eq, ne)  
  - `balance` (gt, ge, lt, le, eq, ne)  
  - `paypointLegal` (ne, eq, ct, nct)  
  - `paypointDba` (ne, eq, ct, nct)  
  - `orgName` (ne, eq, ct, nct)  
  - `externalPaypointId` (ct, nct, eq, ne)  
  - `paypointId` (in, nin, eq, ne)  

List of comparison accepted - enclosed between parentheses:  

  - eq or empty => equal  
  - gt => greater than  
  - ge => greater or equal  
  - lt => less than  
  - le => less or equal  
  - ne => not equal  
  - ct => contains  
  - nct => not contains  
  - in => inside array separated by "|"  
  - nin => not inside array separated by "|"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.query.<a href="src/seed/query/client.py">list_vcards_org</a>(...) -> VCardQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve a list of vcards (virtual credit cards) issued for an organization. Use filters to limit results. Include the `exportFormat` query parameter to return the results as a file instead of a JSON response.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.query.list_vcards_org(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**export_format:** `typing.Optional[ExportFormat]` 
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 

Collection of field names, conditions, and values used to filter the query. 
<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>
List of field names accepted:  

  - `status` (in, nin, eq, ne)  
  - `createdAt` (gt, ge, lt, le, eq, ne)  
  - `cardToken` (ct, nct, eq, ne)  
  - `lastFour` (ct, nct, eq, ne)  
  - `expirationDate` (ct, nct, eq, ne)  
  - `payoutId` (ct, nct, eq, ne, in, nin)  
  - `vendorId` (ct, nct, eq, ne, in, nin)  
  - `miscData1` (ct, nct, eq, ne)  
  - `miscData2` (ct, nct, eq, ne)  
  - `currentUses` (gt, ge, lt, le, eq, ne)  
  - `amount` (gt, ge, lt, le, eq, ne)  
  - `balance` (gt, ge, lt, le, eq, ne)  
  - `paypointLegal` (ne, eq, ct, nct)  
  - `paypointDba` (ne, eq, ct, nct)  
  - `orgName` (ne, eq, ct, nct)  
  - `externalPaypointId` (ct, nct, eq, ne)  
  - `paypointId` (in, nin, eq, ne)  

List of comparison accepted - enclosed between parentheses:  

  - eq or empty => equal  
  - gt => greater than  
  - ge => greater or equal  
  - lt => less than  
  - le => less or equal  
  - ne => not equal  
  - ct => contains  
  - nct => not contains  
  - in => inside array separated by "|"  
  - nin => not inside array separated by "|"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Statistic
<details><summary><code>client.statistic.<a href="src/seed/statistic/client.py">basic_stats</a>(...) -> typing.List[StatBasicExtendedQueryRecord]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the basic statistics for an organization or a paypoint, for a given time period, grouped by a particular frequency. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.statistic.basic_stats(
    entry_id=1000000,
    freq="m",
    level=1,
    mode="ytd",
    end_date="2025-11-01",
    start_date="2025-11-30",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**mode:** `str` 

Mode for the request. Allowed values:

- `custom` - Allows you to set a custom date range
- `ytd` - Year To Date
- `mtd` - Month To Date
- `wtd` - Week To Date
- `today` - All current day
- `m12` - Last 12 months
- `d30` - Last 30 days
- `h24` - Last 24 hours
- `lasty` - Last Year
- `lastm` - Last Month
- `lastw` - Last Week
- `yesterday` - Last Day
  
    
</dd>
</dl>

<dl>
<dd>

**freq:** `str` 

Frequency to group series. Allowed values:

- `m` - monthly
- `w` - weekly
- `d` - daily
- `h` - hourly

For example, `w` groups the results by week.
    
</dd>
</dl>

<dl>
<dd>

**level:** `int` 

The entry level for the request: 
  - 0 for Organization
  - 2 for Paypoint
    
</dd>
</dl>

<dl>
<dd>

**entry_id:** `int` — Identifier in Payabli for the entity.
    
</dd>
</dl>

<dl>
<dd>

**end_date:** `typing.Optional[str]` 

Used with `custom` mode. The end date for the range. 
Valid formats:
  - YYYY-mm-dd
  - YYYY/mm/dd
  - mm-dd-YYYY
  - mm/dd/YYYY
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` — List of parameters.
    
</dd>
</dl>

<dl>
<dd>

**start_date:** `typing.Optional[str]` 

Used with `custom` mode. The start date for the range. 
Valid formats:
   - YYYY-mm-dd
   - YYYY/mm/dd
   -  mm-dd-YYYY
   - mm/dd/YYYY
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.statistic.<a href="src/seed/statistic/client.py">customer_basic_stats</a>(...) -> typing.List[SubscriptionStatsQueryRecord]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the basic statistics for a customer for a specific time period, grouped by a selected frequency. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.statistic.customer_basic_stats(
    customer_id=998,
    freq="m",
    mode="ytd",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**mode:** `str` 

Mode for request. Allowed values:

- `ytd` - Year To Date
- `mtd` - Month To Date
- `wtd` - Week To Date
- `today` - All current day
- `m12` - Last 12 months
- `d30` - Last 30 days
- `h24` - Last 24 hours
- `lasty` - Last Year
- `lastm` - Last Month
- `lastw` - Last Week
- `yesterday` - Last Day
    
</dd>
</dl>

<dl>
<dd>

**freq:** `str` 

Frequency to group series. Allowed values:

- `m` - monthly
- `w` - weekly
- `d` - daily
- `h` - hourly

For example, `w` groups the results by week.
    
</dd>
</dl>

<dl>
<dd>

**customer_id:** `int` — Payabli-generated customer ID. Maps to "Customer ID" column in PartnerHub. 
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` — List of parameters.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.statistic.<a href="src/seed/statistic/client.py">sub_stats</a>(...) -> typing.List[StatBasicQueryRecord]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves the subscription statistics for a given interval for a paypoint or organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.statistic.sub_stats(
    entry_id=1000000,
    interval="30",
    level=1,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**interval:** `str` 

Interval to get the data. Allowed values:

- `all` - all intervals
- `30` - 1-30 days
- `60` - 31-60 days
- `90` - 61-90 days
- `plus` - +90 days
    
</dd>
</dl>

<dl>
<dd>

**level:** `int` 

The entry level for the request: 
  - 0 for Organization
  - 2 for Paypoint
    
</dd>
</dl>

<dl>
<dd>

**entry_id:** `int` — Identifier in Payabli for the entity.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` — List of parameters
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.statistic.<a href="src/seed/statistic/client.py">vendor_basic_stats</a>(...) -> typing.List[StatisticsVendorQueryRecord]</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieve the basic statistics about a vendor for a given time period, grouped by frequency. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.statistic.vendor_basic_stats(
    freq="m",
    id_vendor=1,
    mode="ytd",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**mode:** `str` 

Mode for request. Allowed values:

- `ytd` - Year To Date
- `mtd` - Month To Date
- `wtd` - Week To Date
- `today` - All current day
- `m12` - Last 12 months
- `d30` - Last 30 days
- `h24` - Last 24 hours
- `lasty` - Last Year
- `lastm` - Last Month
- `lastw` - Last Week
- `yesterday` - Last Day
    
</dd>
</dl>

<dl>
<dd>

**freq:** `str` 

Frequency to group series. Allowed values:

- `m` - monthly
- `w` - weekly
- `d` - daily
- `h` - hourly

For example, `w` groups the results by week.
    
</dd>
</dl>

<dl>
<dd>

**id_vendor:** `int` — Vendor ID.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` — List of parameters
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Subscription
<details><summary><code>client.subscription.<a href="src/seed/subscription/client.py">get_subscription</a>(...) -> SubscriptionQueryRecords</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a single subscription's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.subscription.get_subscription(
    sub_id=263,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sub_id:** `int` — The subscription ID. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.subscription.<a href="src/seed/subscription/client.py">new_subscription</a>(...) -> AddSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a subscription or scheduled payment to run at a specified time and frequency. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest, PaymentDetail, PayMethodCredit, ScheduleDetail
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.subscription.new_subscription(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    payment_details=PaymentDetail(
        service_fee=0,
        total_amount=100,
    ),
    payment_method=PayMethodCredit(
        cardcvv="123",
        cardexp="02/25",
        card_holder="John Cassian",
        cardnumber="4111111111111111",
        cardzip="37615",
        initiator="payor",
        method="card",
    ),
    schedule_details=ScheduleDetail(
        end_date="03-20-2025",
        frequency="weekly",
        plan_id=1,
        start_date="09-20-2024",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `SubscriptionRequestBody` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.subscription.<a href="src/seed/subscription/client.py">remove_subscription</a>(...) -> RemoveSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a subscription, autopay, or recurring payment and prevents future charges.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.subscription.remove_subscription(
    sub_id=396,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sub_id:** `int` — The subscription ID. 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.subscription.<a href="src/seed/subscription/client.py">update_subscription</a>(...) -> UpdateSubscriptionResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a subscription's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.subscription.update_subscription(
    sub_id=231,
    set_pause=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**sub_id:** `int` — The subscription ID. 
    
</dd>
</dl>

<dl>
<dd>

**payment_details:** `typing.Optional[PaymentDetail]` — Object describing details of the payment. To skip the payment, set the `totalAmount` to 0. Payments will be paused until the amount is updated to a non-zero value. When `totalAmount` is set to 0, the `serviceFee` must also be set to 0.
    
</dd>
</dl>

<dl>
<dd>

**schedule_details:** `typing.Optional[ScheduleDetail]` — Object describing the schedule for subscription
    
</dd>
</dl>

<dl>
<dd>

**set_pause:** `typing.Optional[SetPause]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Templates
<details><summary><code>client.templates.<a href="src/seed/templates/client.py">delete_template</a>(...) -> PayabliApiResponseTemplateId</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a template by ID. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.templates.delete_template(
    template_id=80,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**template_id:** `float` — The boarding template ID. Can be found at the end of the boarding template URL in PartnerHub. Example: `https://partner-sandbox.payabli.com/myorganization/boarding/edittemplate/80`. Here, the template ID is `80`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="src/seed/templates/client.py">getlink_template</a>(...) -> BoardingLinkApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Generates a boarding link from a boarding template.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.templates.getlink_template(
    ignore_empty=True,
    template_id=80,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**template_id:** `float` — The boarding template ID. Can be found at the end of the boarding template URL in PartnerHub. Example: `https://partner-sandbox.payabli.com/myorganization/boarding/edittemplate/80`. Here, the template ID is `80`.
    
</dd>
</dl>

<dl>
<dd>

**ignore_empty:** `bool` — Ignore read-only and empty fields Default is `false`. If `ignoreEmpty` = `false` and any field is empty, then the request returns a failure response. If `ignoreEmpty` = `true`, the request returns the boarding link name regardless of whether fields are empty.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="src/seed/templates/client.py">get_template</a>(...) -> TemplateQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a boarding template's details by ID.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.templates.get_template(
    template_id=80,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**template_id:** `float` — The boarding template ID. Can be found at the end of the boarding template URL in PartnerHub. Example: `https://partner-sandbox.payabli.com/myorganization/boarding/edittemplate/80`. Here, the template ID is `80`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.templates.<a href="src/seed/templates/client.py">list_templates</a>(...) -> TemplateQueryResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a list of boarding templates for an organization. Use filters to limit results. You can't make a request that includes filters from the API console in the documentation. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.templates.list_templates(
    org_id=123,
    from_record=251,
    limit_record=0,
    sort_by="desc(field_name)",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**org_id:** `int` — The numeric identifier for organization, assigned by Payabli.
    
</dd>
</dl>

<dl>
<dd>

**from_record:** `typing.Optional[int]` — The number of records to skip before starting to collect the result set.
    
</dd>
</dl>

<dl>
<dd>

**limit_record:** `typing.Optional[int]` — Max number of records to return for the query. Use `0` or negative value to return all records.
    
</dd>
</dl>

<dl>
<dd>

**parameters:** `typing.Optional[typing.Dict[str, typing.Optional[str]]]` 


Collection of field names, conditions, and values used to filter the query.

<Info>
  **You must remove `parameters=` from the request before you send it, otherwise Payabli will ignore the filters.**

  Because of a technical limitation, you can't make a request that includes filters from the API console on this page. The response won't be filtered. Instead, copy the request, remove `parameters=` and run the request in a different client.

  For example:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?parameters=totalAmount(gt)=1000&limitRecord=20

  should become:

  --url https://api-sandbox.payabli.com/api/Query/transactions/org/236?totalAmount(gt)=1000&limitRecord=20
</Info>


See [Filters and Conditions Reference](/developers/developer-guides/pay-ops-reporting-engine-overview#filters-and-conditions-reference) for help.

List of field names accepted:
- `createdAt` (gt, ge, lt, le, eq, ne)
- `title` (ct, nct)
- `description` (ct, nct)
- `code` (ct, nct)
- `orgParentname` (ct, nct)

List of comparison accepted - enclosed between parentheses:
- eq or empty => equal
- gt => greater than
- ge => greater or equal
- lt => less than
- le => less or equal
- ne => not equal
- ct => contains
- nct => not contains
- in => inside array
- nin => not inside array

List of parameters accepted:
- limitRecord : max number of records for query (default="20", "0" or negative value for all)
- fromRecord : initial record in query

Example: title(ct)=hoa return all records with title containing "hoa"
    
</dd>
</dl>

<dl>
<dd>

**sort_by:** `typing.Optional[str]` — The field name to use for sorting results. Use `desc(field_name)` to sort descending by `field_name`, and use `asc(field_name)` to sort ascending by `field_name`.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## TokenStorage
<details><summary><code>client.token_storage.<a href="src/seed/token_storage/client.py">add_method</a>(...) -> AddMethodResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Saves a payment method for reuse. This call exchanges sensitive payment information for a token that can be used to process future transactions. The `ReferenceId` value in the response is the `storedMethodId` to use with transactions.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest
from seed.environment import SeedApiEnvironment
from seed.token_storage import TokenizeCard

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.token_storage.add_method(
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    fallback_auth=True,
    fallback_auth_amount=100,
    method_description="Primary Visa card",
    payment_method=TokenizeCard(
        cardcvv="123",
        cardexp="02/25",
        card_holder="John Doe",
        cardnumber="4111111111111111",
        cardzip="12345",
        method="card",
    ),
    source="api",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `RequestTokenStorage` 
    
</dd>
</dl>

<dl>
<dd>

**ach_validation:** `typing.Optional[AchValidation]` 
    
</dd>
</dl>

<dl>
<dd>

**create_anonymous:** `typing.Optional[CreateAnonymous]` 
    
</dd>
</dl>

<dl>
<dd>

**force_customer_creation:** `typing.Optional[ForceCustomerCreation]` 
    
</dd>
</dl>

<dl>
<dd>

**temporary:** `typing.Optional[Temporary]` 
    
</dd>
</dl>

<dl>
<dd>

**idempotency_key:** `typing.Optional[IdempotencyKey]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.token_storage.<a href="src/seed/token_storage/client.py">get_method</a>(...) -> GetMethodResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves details for a saved payment method.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.token_storage.get_method(
    method_id="32-8877drt00045632-678",
    card_expiration_format=1,
    include_temporary=False,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**method_id:** `str` — The saved payment method ID.
    
</dd>
</dl>

<dl>
<dd>

**card_expiration_format:** `typing.Optional[int]` 

Format for card expiration dates in the response. 

Accepted values:
  
- 0: default, no formatting. Expiration dates are returned in the format they're saved in.

- 1: MMYY
 
- 2: MM/YY
    
</dd>
</dl>

<dl>
<dd>

**include_temporary:** `typing.Optional[bool]` — When `true`, the request will include temporary tokens in the search and return details for a matching temporary token. The default behavior searches only for permanent tokens.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.token_storage.<a href="src/seed/token_storage/client.py">remove_method</a>(...) -> PayabliApiResponsePaymethodDelete</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Deletes a saved payment method.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.token_storage.remove_method(
    method_id="32-8877drt00045632-678",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**method_id:** `str` — The saved payment method ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.token_storage.<a href="src/seed/token_storage/client.py">update_method</a>(...) -> PayabliApiResponsePaymethodDelete</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a saved payment method.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, PayorDataRequest
from seed.environment import SeedApiEnvironment
from seed.token_storage import TokenizeCard

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.token_storage.update_method(
    method_id="32-8877drt00045632-678",
    customer_data=PayorDataRequest(
        customer_id=4440,
    ),
    entry_point="f743aed24a",
    fallback_auth=True,
    payment_method=TokenizeCard(
        cardcvv="123",
        cardexp="02/25",
        card_holder="John Doe",
        cardnumber="4111111111111111",
        cardzip="12345",
        method="card",
    ),
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**method_id:** `str` — The saved payment method ID.
    
</dd>
</dl>

<dl>
<dd>

**request:** `RequestTokenStorage` 
    
</dd>
</dl>

<dl>
<dd>

**ach_validation:** `typing.Optional[AchValidation]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## User
<details><summary><code>client.user.<a href="src/seed/user/client.py">add_user</a>(...) -> AddUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to add a new user to an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.add_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">auth_refresh_user</a>() -> PayabliApiResponseUserMfa</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to refresh the authentication token for a user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.auth_refresh_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">auth_reset_user</a>(...) -> AuthResetUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to initiate a password reset for a user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.auth_reset_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**email:** `typing.Optional[Email]` — The user's email address.
    
</dd>
</dl>

<dl>
<dd>

**entry:** `typing.Optional[str]` — Identifier for entrypoint originating the request (used by front-end apps)
    
</dd>
</dl>

<dl>
<dd>

**entry_type:** `typing.Optional[int]` — Type of entry identifier: 0 - partner, 2 - paypoint. This is used by front-end apps, required if an Entry is indicated.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">auth_user</a>(...) -> PayabliApiResponseMfaBasic</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

This endpoint requires an application API token.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.auth_user(
    provider="provider",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**provider:** `str` — Auth provider. This fields is optional and defaults to null for the built-in provider.
    
</dd>
</dl>

<dl>
<dd>

**email:** `typing.Optional[Email]` 
    
</dd>
</dl>

<dl>
<dd>

**entry:** `typing.Optional[str]` — Identifier for entry point originating the request (used by front-end apps)
    
</dd>
</dl>

<dl>
<dd>

**entry_type:** `typing.Optional[int]` — Type of entry identifier: 0 - partner, 2 - paypoint. This is used by front-end apps, required if an Entry is indicated.
    
</dd>
</dl>

<dl>
<dd>

**psw:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**user_id:** `typing.Optional[int]` 
    
</dd>
</dl>

<dl>
<dd>

**user_token_id:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">change_psw_user</a>(...) -> ChangePswUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to change the password for a user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.change_psw_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**psw:** `typing.Optional[str]` — New User password
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">delete_user</a>(...) -> DeleteUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to delete a specific user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.delete_user(
    user_id=1000000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `int` — The Payabli-generated `userId` value.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">edit_mfa_user</a>(...) -> EditMfaUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to enable or disable multi-factor authentication (MFA) for a user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.edit_mfa_user(
    user_id=1000000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `int` — User Identifier
    
</dd>
</dl>

<dl>
<dd>

**request:** `MfaData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">edit_user</a>(...) -> PayabliApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to modify the details of a specific user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.edit_user(
    user_id=1000000,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `int` — User Identifier
    
</dd>
</dl>

<dl>
<dd>

**request:** `UserData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">get_user</a>(...) -> UserQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to retrieve information about a specific user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.get_user(
    user_id=1000000,
    entry="478ae1234",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**user_id:** `int` — The Payabli-generated `userId` value.
    
</dd>
</dl>

<dl>
<dd>

**entry:** `typing.Optional[str]` — The entrypoint identifier.
    
</dd>
</dl>

<dl>
<dd>

**level:** `typing.Optional[int]` — Entry level: 0 - partner, 2 - paypoint
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">logout_user</a>() -> LogoutUserResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to log a user out from the system.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.logout_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">resend_mfa_code</a>(...) -> PayabliApiResponseMfaBasic</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Resends the MFA code to the user via the selected MFA mode (email or SMS).
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.resend_mfa_code(
    entry="Entry",
    entry_type=1,
    usrname="usrname",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**usrname:** `str` —  
    
</dd>
</dl>

<dl>
<dd>

**entry:** `str` —  
    
</dd>
</dl>

<dl>
<dd>

**entry_type:** `int` —  
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.user.<a href="src/seed/user/client.py">validate_mfa_user</a>(...) -> PayabliApiResponseUserMfa</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Use this endpoint to validate the multi-factor authentication (MFA) code for a user within an organization.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.user.validate_mfa_user()

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**mfa_code:** `typing.Optional[str]` 
    
</dd>
</dl>

<dl>
<dd>

**mfa_validation_code:** `typing.Optional[MfaValidationCode]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Vendor
<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">add_vendor</a>(...) -> PayabliApiResponseVendors</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a vendor in an entrypoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi, Contacts, BillingData
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.vendor.add_vendor(
    entry="8cfec329267",
    vendor_number="1234",
    name_1="Herman\'s Coatings and Masonry",
    name_2="<string>",
    ein="12-3456789",
    phone="5555555555",
    email="example@email.com",
    address_1="123 Ocean Drive",
    address_2="Suite 400",
    city="Miami",
    state="FL",
    zip="33139",
    country="US",
    mcc="7777",
    location_code="MIA123",
    contacts=[
        Contacts(
            contact_name="Herman Martinez",
            contact_email="example@email.com",
            contact_title="Owner",
            contact_phone="3055550000",
        )
    ],
    billing_data=BillingData(
        id=123,
        bank_name="Country Bank",
        routing_account="123123123",
        account_number="123123123",
        type_account="Checking",
        bank_account_holder_name="Gruzya Adventure Outfitters LLC",
        bank_account_holder_type="Business",
        bank_account_function=0,
    ),
    payment_method="managed",
    vendor_status=1,
    remit_address_1="123 Walnut Street",
    remit_address_2="Suite 900",
    remit_city="Miami",
    remit_state="FL",
    remit_zip="31113",
    remit_country="US",
    payee_name_1="<string>",
    payee_name_2="<string>",
    customer_vendor_account="A-37622",
    internal_reference_id=123,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `str` — Entrypoint identifier.
    
</dd>
</dl>

<dl>
<dd>

**request:** `VendorData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">delete_vendor</a>(...) -> PayabliApiResponseVendors</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Delete a vendor. 
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.vendor.delete_vendor(
    id_vendor=1,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_vendor:** `int` — Vendor ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">edit_vendor</a>(...) -> PayabliApiResponseVendors</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Updates a vendor's information. Send only the fields you need to update.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.vendor.edit_vendor(
    id_vendor=1,
    name_1="Theodore\'s Janitorial",
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_vendor:** `int` — Vendor ID.
    
</dd>
</dl>

<dl>
<dd>

**request:** `VendorData` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.vendor.<a href="src/seed/vendor/client.py">get_vendor</a>(...) -> VendorQueryRecord</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Retrieves a vendor's details.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.vendor.get_vendor(
    id_vendor=1,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**id_vendor:** `int` — Vendor ID.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Wallet
<details><summary><code>client.wallet.<a href="src/seed/wallet/client.py">configure_apple_pay_organization</a>(...) -> ConfigureApplePayOrganizationApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Configure and activate Apple Pay for a Payabli organization
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.wallet.configure_apple_pay_organization(
    cascade=True,
    is_enabled=True,
    org_id=901,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**cascade:** `typing.Optional[Cascade]` 
    
</dd>
</dl>

<dl>
<dd>

**is_enabled:** `typing.Optional[IsEnabled]` 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `typing.Optional[OrganizationId]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.wallet.<a href="src/seed/wallet/client.py">configure_apple_pay_paypoint</a>(...) -> ConfigureApplePaypointApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Configure and activate Apple Pay for a Payabli paypoint
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.wallet.configure_apple_pay_paypoint(
    entry="8cfec329267",
    is_enabled=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `typing.Optional[Entry]` 
    
</dd>
</dl>

<dl>
<dd>

**is_enabled:** `typing.Optional[IsEnabled]` — When `true`, Apple Pay is enabled.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.wallet.<a href="src/seed/wallet/client.py">configure_google_pay_organization</a>(...) -> ConfigureApplePayOrganizationApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Configure and activate Google Pay for a Payabli organization
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.wallet.configure_google_pay_organization(
    cascade=True,
    is_enabled=True,
    org_id=901,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**cascade:** `typing.Optional[Cascade]` 
    
</dd>
</dl>

<dl>
<dd>

**is_enabled:** `typing.Optional[IsEnabled]` 
    
</dd>
</dl>

<dl>
<dd>

**org_id:** `typing.Optional[OrganizationId]` 
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.wallet.<a href="src/seed/wallet/client.py">configure_google_pay_paypoint</a>(...) -> ConfigureGooglePaypointApiResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Configure and activate Google Pay for a Payabli paypoint
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```python
from seed import SeedApi
from seed.environment import SeedApiEnvironment

client = SeedApi(
    api_key="<value>",
    environment=SeedApiEnvironment.SANDBOX,
)

client.wallet.configure_google_pay_paypoint(
    entry="8cfec329267",
    is_enabled=True,
)

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**entry:** `typing.Optional[Entry]` 
    
</dd>
</dl>

<dl>
<dd>

**is_enabled:** `typing.Optional[IsEnabled]` — When `true`, Google Pay is enabled.
    
</dd>
</dl>

<dl>
<dd>

**request_options:** `typing.Optional[RequestOptions]` — Request-specific configuration.
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

