# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersWithCursor < Internal::Types::Model
      field :cursor, -> { String }, optional: true, nullable: false
    end
  end
end
