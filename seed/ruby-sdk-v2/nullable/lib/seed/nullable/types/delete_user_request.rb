# frozen_string_literal: true

module Seed
  module Nullable
    module Types
      class DeleteUserRequest < Internal::Types::Model
        field :username, -> { String }, optional: true, nullable: true
      end
    end
  end
end
