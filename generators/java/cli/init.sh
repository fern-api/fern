configPath=$1

cd /cli/cli-"$VERSION"
java -cp cli-"$VERSION".jar:lib/* \
  com.fern.java.client.cli.ClientGeneratorCli "$configPath"
