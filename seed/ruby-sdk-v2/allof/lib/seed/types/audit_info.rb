# frozen_string_literal: true

module Seed
  module Types
    # Common audit metadata.
    class AuditInfo < Internal::Types::Model
      field :created_by, -> { String }, optional: true, nullable: false, api_name: "createdBy"

      field :created_date_time, -> { String }, optional: true, nullable: false, api_name: "createdDateTime"

      field :modified_by, -> { String }, optional: true, nullable: false, api_name: "modifiedBy"

      field :modified_date_time, -> { String }, optional: true, nullable: false, api_name: "modifiedDateTime"
    end
  end
end
