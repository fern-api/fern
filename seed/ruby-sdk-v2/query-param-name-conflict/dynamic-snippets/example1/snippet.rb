require "seed"

client = Seed::Client.new(base_url: "https://api.fern.com")

client.bulk_update_tasks(
  filter_assigned_to: "filter_assigned_to",
  filter_is_complete: "filter_is_complete",
  filter_date: "filter_date",
  fields: "_fields",
  bulk_update_tasks_request_assigned_to: "assigned_to",
  bulk_update_tasks_request_date: "2023-01-15",
  bulk_update_tasks_request_is_complete: true,
  text: "text"
)
