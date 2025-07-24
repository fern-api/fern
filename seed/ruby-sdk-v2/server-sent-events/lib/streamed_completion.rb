# frozen_string_literal: true

module Completions
    module Types
        class StreamedCompletion < Internal::Types::Model
            field :delta, String, optional: true, nullable: true
            field :tokens, Array, optional: true, nullable: true
        end
    end
end
