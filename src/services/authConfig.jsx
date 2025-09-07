export const authConfig = {
  clientId:'oauth2-empower-client',
  authorizationEndpoint:'http://localhost:8443/realms/oauth2-empower-realm/protocol/openid-connect/auth',
  tokenEndpoint:'http://localhost:8443/realms/oauth2-empower-realm/protocol/openid-connect/token',
  redirectUri:'http://localhost:5173',
  scope:'openid profile email roles offline_access',
  onRefreshTokenExpire: (event)=>event.logIn(),  
};

export default authConfig;
