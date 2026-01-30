# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsersTopLevelCursorPaginationResponse < Internal::Types::Model
        field :next_cursor, -> { String }, optional: true, nullable: false
        field :data, -> { Internal::Types::Array[Seed::Users::Types::User] }, optional: false, nullable: false
      end
    end
  end
end
