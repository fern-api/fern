# frozen_string_literal: true

module FernPaginationCustom
  module Types
    class UsernameCursor < Internal::Types::Model
      field :cursor, -> { FernPaginationCustom::Types::UsernamePage }, optional: false, nullable: false
    end
  end
end
