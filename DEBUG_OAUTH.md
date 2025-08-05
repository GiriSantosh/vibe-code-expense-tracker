# OAuth2 Debugging Guide

## 🔍 How to Debug the OAuth2 Flow

### 1. **Check the OAuth2 Authorization URL**
When you click "Sign in with OAuth2", check the browser's network tab or URL bar to see what parameters are being sent:

**Expected URL should look like:**
```
http://localhost:8081/realms/expense-tracker/protocol/openid-connect/auth?
response_type=code&
client_id=expense-tracker&
scope=openid%20profile%20email&
redirect_uri=http://localhost:8080/login/oauth2/code/keycloak&
prompt=login&
max_age=0
```

**Key parameters to verify:**
- `prompt=login` - Forces re-authentication
- `max_age=0` - Forces fresh authentication 
- Look for these in the actual URL

### 2. **Check Console Logs**
The backend will now print debug information. Look for:
```
OAuth2 Authorization Request - Additional Parameters: {prompt=login, max_age=0}
```

### 3. **Alternative Manual URLs**
If the automatic parameters don't work, try these direct URLs:

**Force Login (bypass SSO):**
```
http://localhost:8080/oauth2/authorization/keycloak?prompt=login
```

**Force Account Selection:**
```
http://localhost:8080/oauth2/authorization/keycloak?prompt=select_account
```

**Force Both:**
```
http://localhost:8080/oauth2/authorization/keycloak?prompt=login&max_age=0
```

### 4. **Keycloak Admin Console Check**
1. Go to: http://localhost:8081/admin
2. Login with admin credentials
3. Go to `expense-tracker` realm
4. Check `Sessions` tab - see if User A's session is still active after logout

### 5. **Browser Testing Steps**
1. **Clear browser data completely** (important!)
2. Login as User A
3. Logout
4. **Check cookies** - should be empty
5. Try to login - should show Keycloak login form
6. **Check the URL** when redirected to Keycloak - verify parameters

### 6. **Alternative Solution - Nuclear Logout**
If parameters don't work, we can implement a "nuclear" logout that directly calls Keycloak's logout endpoint:

```typescript
// In AuthContext.tsx - alternative logout method
const nuclearLogout = () => {
  // Clear all browser state
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  localStorage.clear();
  sessionStorage.clear();
  
  // Direct logout from Keycloak with kc_idp_hint to force account selection
  window.location.href = 'http://localhost:8081/realms/expense-tracker/protocol/openid-connect/logout?' +
    'post_logout_redirect_uri=http://localhost:3000/&' +
    'kc_idp_hint=keycloak';
};
```

## 🐛 Common Issues

### Issue 1: Parameters Not Being Added
**Problem:** The customizer might not be working
**Solution:** Check console logs for the debug message

### Issue 2: Keycloak Ignoring prompt=login  
**Problem:** Some Keycloak versions don't respect prompt parameter
**Solution:** Use direct logout URL approach

### Issue 3: Browser Cache
**Problem:** Browser cached redirect
**Solution:** Hard refresh (Ctrl+Shift+R) or incognito mode

### Issue 4: SSO Session Persistence
**Problem:** Keycloak admin console shows active sessions
**Solution:** Logout endpoint might not be calling Keycloak properly

## 🧪 Test This:
1. Run the application
2. Check the actual OAuth2 URL when you click login
3. Report back what parameters you see in the URL
4. Let me know if you see the debug console message

This will help me identify exactly what's happening!