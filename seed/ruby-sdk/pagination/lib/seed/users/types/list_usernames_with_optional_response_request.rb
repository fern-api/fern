# frozen_string_literal: true

module Seed
  module Users
    module Types
      class ListUsernamesWithOptionalResponseRequest < Internal::Types::Model
        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
