# frozen_string_literal: true

module Seed
  module EndpointsPagination
    module Types
      class EndpointsPaginationListItemsRequest < Internal::Types::Model
        field :cursor, -> { String }, optional: true, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
