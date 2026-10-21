# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class Failure < Internal::Types::Model
      field :status, -> { String }, optional: false, nullable: false
    end
  end
end
