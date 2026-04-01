# frozen_string_literal: true

module Seed
  module Types
    class ProtocolNumberEvent < Internal::Types::Model
      field :data, -> { Integer }, optional: false, nullable: false
    end
  end
end
