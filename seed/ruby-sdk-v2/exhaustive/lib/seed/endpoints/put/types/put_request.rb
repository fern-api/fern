# frozen_string_literal: true

module Seed
  module Endpoints
    module Put
      module Types
        class PutRequest < Internal::Types::Model
          field :id, -> { String }, optional: false, nullable: false
        end
      end
    end
  end
end
