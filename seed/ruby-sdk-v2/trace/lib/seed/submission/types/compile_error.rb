# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class CompileError < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
