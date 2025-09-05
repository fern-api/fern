# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class Conversation < Internal::Types::Model
        field :foo, -> { String }, optional: false, nullable: false
      end
    end
  end
end
