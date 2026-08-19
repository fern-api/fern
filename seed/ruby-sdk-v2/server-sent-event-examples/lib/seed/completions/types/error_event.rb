# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class ErrorEvent < Internal::Types::Model
        field :error, -> { String }, optional: false, nullable: false

        field :code, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
