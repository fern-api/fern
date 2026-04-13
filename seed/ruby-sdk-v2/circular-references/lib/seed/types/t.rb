# frozen_string_literal: true

module Seed
  module Types
    class T < Internal::Types::Model
      field :child, -> { Seed::Types::TorU }, optional: false, nullable: false
    end
  end
end
