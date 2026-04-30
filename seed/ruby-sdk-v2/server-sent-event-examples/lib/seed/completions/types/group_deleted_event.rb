# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class GroupDeletedEvent < Internal::Types::Model
        field :offset, -> { String }, optional: false, nullable: false

        field :group_id, -> { String }, optional: false, nullable: false
      end
    end
  end
end
