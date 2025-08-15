# frozen_string_literal: true

module Seed
    module Types
        class StreamedCompletion < Internal::Types::Model
            field :delta, String, optional: false, nullable: false
            field :tokens, Integer, optional: true, nullable: false
        end
    end
end
