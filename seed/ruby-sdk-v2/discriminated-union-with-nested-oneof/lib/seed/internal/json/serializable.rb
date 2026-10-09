# frozen_string_literal: true

module Seed
  module Internal
    module JSON
      module Serializable
        # Loads data from JSON into its deserialized form
        #
        # @param str [String] Raw JSON to load into an object
        # @return [Object]
        def load(str)
          raise NotImplementedError
        end

        # Dumps data from its deserialized form into JSON
        #
        # @param value [Object] The deserialized value
        # @return [String]
        def dump(value)
          raise NotImplementedError
        end
      end
    end
  end
end
