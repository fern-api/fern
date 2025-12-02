# frozen_string_literal: true

module Seed
  module Types
    module Types
      # MovieId is an alias for String
      module MovieId
        def self.load(str)
          ::JSON.parse(str)
        end

        def self.dump(value)
          ::JSON.generate(value)
        end
      end
    end
  end
end
