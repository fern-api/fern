# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersMixedTypeCursorPaginationRequest < Internal::Types::Model
        field :cursor, -> { String }, optional: true, nullable: false
      end
    end
  end
end
