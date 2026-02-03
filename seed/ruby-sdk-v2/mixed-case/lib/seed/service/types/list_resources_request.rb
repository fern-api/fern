# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ListResourcesRequest < Internal::Types::Model
        field :page_limit, -> { Integer }, optional: false, nullable: false
        field :before_date, -> { String }, optional: false, nullable: false, api_name: "beforeDate"
      end
    end
  end
end
