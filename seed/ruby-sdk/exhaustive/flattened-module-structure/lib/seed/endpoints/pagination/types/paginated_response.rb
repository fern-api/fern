# frozen_string_literal: true

module Seed
  module Endpoints
    module Pagination
      module Types
        class PaginatedResponse < Internal::Types::Model
          field :items, -> { Internal::Types::Array[Seed::Types::Object_::Types::ObjectWithRequiredField] }, optional: false, nullable: false
          field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
        end
      end
    end
  end
end
