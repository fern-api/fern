# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServiceNopRequest < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :nested_id, -> { String }, optional: false, nullable: false, api_name: "nestedId"
      end
    end
  end
end
