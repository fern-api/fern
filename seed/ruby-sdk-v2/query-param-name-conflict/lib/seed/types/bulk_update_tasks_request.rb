# frozen_string_literal: true

module Seed
  module Types
    class BulkUpdateTasksRequest < Internal::Types::Model
      field :filter_assigned_to, -> { String }, optional: true, nullable: false, api_name: "assigned_to"

      field :filter_is_complete, -> { String }, optional: true, nullable: false, api_name: "is_complete"

      field :filter_date, -> { String }, optional: true, nullable: false, api_name: "date"

      field :fields, -> { String }, optional: true, nullable: false, api_name: "_fields"

      field :bulk_update_tasks_request_assigned_to, -> { String }, optional: true, nullable: false, api_name: "assigned_to"

      field :bulk_update_tasks_request_date, -> { String }, optional: true, nullable: false, api_name: "date"

      field :bulk_update_tasks_request_is_complete, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "is_complete"

      field :text, -> { String }, optional: true, nullable: false
    end
  end
end
