# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class StackFrame < Internal::Types::Model
        field :method_name, -> { String }, optional: false, nullable: false
        field :line_number, -> { Integer }, optional: false, nullable: false
        field :scopes, -> { Internal::Types::Array[Seed::Submission::Types::Scope] }, optional: false, nullable: false
      end
    end
  end
end
