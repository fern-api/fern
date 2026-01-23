# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersTopLevelBodyCursorPaginationRequest < Internal::Types::Model
        field :cursor, -> { String }, optional: true, nullable: false
        field :filter, -> { String }, optional: true, nullable: false
      end
    end
  end
end
