

module Seed
    class Client
        # @return [Seed::Client]
        def initialize(base_url:, token:)
            @raw_client = Seed::Internal::Http::RawClient.new(
                base_url: base_url,
                headers: {
                    'User-Agent':'fern_multi-url-environment/0.0.1',
                    'X-Fern-Language':'Ruby',
                    Authorization:"Bearer #{token}"
                }
            )
        end
        # @return [Seed::Ec2::Client]
        def ec2
            @ec2 ||= Seed::Ec2::Client.new(client: @raw_client)
        end
        # @return [Seed::S3::Client]
        def s3
            @s3 ||= Seed::S3::Client.new(client: @raw_client)
        end

end
