# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class RuntimeError < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
      end
    end
  end
end
