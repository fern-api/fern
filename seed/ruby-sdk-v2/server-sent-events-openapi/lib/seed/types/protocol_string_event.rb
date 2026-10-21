# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class ProtocolStringEvent < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
