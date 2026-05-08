# frozen_string_literal: true

module Seed
  module Endpoints
    module HTTPMethods
      module Types
        class TestDeleteHTTPMethodsRequest < Internal::Types::Model
          field :id, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
