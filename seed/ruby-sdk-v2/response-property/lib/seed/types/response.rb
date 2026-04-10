# frozen_string_literal: true

module Seed
  module Types
    class Response < Internal::Types::Model
      field :data, -> { Seed::Types::Movie }, optional: false, nullable: false
    end
  end
end
