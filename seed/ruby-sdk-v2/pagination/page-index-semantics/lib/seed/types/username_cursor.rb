# frozen_string_literal: true

module Seed
  module Types
    class UsernameCursor < Internal::Types::Model
      field :cursor, -> { Seed::Types::UsernamePage }, optional: false, nullable: false
    end
  end
end
