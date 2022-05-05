configPath=$1
tar -xvf fern-client-cli.tar
rm -rf fern-client-cli.tar
cd ../fern-client-cli-"$VERSION"
echo "$configPath"
java -cp fern-client-cli-"$VERSION".jar:lib/* \
  com.fern.java.client.cli.ClientGeneratorCli "$configPath"