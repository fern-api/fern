# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class ProtocolNumberEvent < Internal::Types::Model
      field :data, -> { Float }, optional: false, nullable: false
    end
  end
end
