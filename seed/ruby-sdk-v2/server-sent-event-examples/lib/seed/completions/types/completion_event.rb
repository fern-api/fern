# frozen_string_literal: true

module Seed
  module Completions
    module Types
      class CompletionEvent < Internal::Types::Model
        field :content, -> { String }, optional: false, nullable: false
      end
    end
  end
end
