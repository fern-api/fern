# frozen_string_literal: true

module Seed
  module Endpoints
    module Pagination
      module Types
        class ListItemsRequest < Internal::Types::Model
          field :cursor, -> { String }, optional: true, nullable: false
          field :limit, -> { Integer }, optional: true, nullable: false
        end
      end
    end
  end
end
