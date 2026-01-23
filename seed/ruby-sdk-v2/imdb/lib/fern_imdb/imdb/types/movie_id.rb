# frozen_string_literal: true

module FernImdb
  module Imdb
    module Types
      module MovieId
        # MovieId is an alias for String

        # @option str [String]
        #
        # @return [untyped]
        def self.load(str)
          ::JSON.parse(str)
        end

        # @option value [untyped]
        #
        # @return [String]
        def self.dump(value)
          ::JSON.generate(value)
        end
      end
    end
  end
end
