// 전역 GraphQL 설정 저장소
class GraphQLConfig {
  private static instance: GraphQLConfig;
  private endpoint: string = '';
  private token: string = '';

  private constructor() {}

  static getInstance(): GraphQLConfig {
    if (!GraphQLConfig.instance) {
      GraphQLConfig.instance = new GraphQLConfig();
    }
    return GraphQLConfig.instance;
  }

  setConfig(endpoint: string, token: string) {
    this.endpoint = endpoint;
    this.token = token;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  getToken(): string {
    return this.token;
  }

  isConfigured(): boolean {
    return this.endpoint !== '' && this.token !== '';
  }
}

export default GraphQLConfig;
