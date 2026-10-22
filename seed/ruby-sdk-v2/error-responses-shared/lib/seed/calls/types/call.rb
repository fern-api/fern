# frozen_string_literal: true

module Seed
  module Calls
    module Types
      class Call < Internal::Types::Model
        field :sid, -> { String }, optional: true, nullable: false
      end
    end
  end
end
