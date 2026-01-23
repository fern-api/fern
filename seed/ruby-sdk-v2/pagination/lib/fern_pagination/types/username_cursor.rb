# frozen_string_literal: true

module FernPagination
  module Types
    class UsernameCursor < Internal::Types::Model
      field :cursor, -> { FernPagination::Types::UsernamePage }, optional: false, nullable: false
    end
  end
end
