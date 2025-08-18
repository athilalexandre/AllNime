# Security Guidelines

## 🔐 API Keys and Secrets

### Never commit API keys to version control!

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Gitignore**: Ensure `.env` files are in `.gitignore`
3. **Example Files**: Use `.example` files for configuration templates

### If you accidentally commit an API key:

1. **Immediate Action**: Revoke the key immediately in the service console
2. **Generate New Key**: Create a new API key
3. **Update Environment**: Update your `.env` file with the new key
4. **Remove from History**: Use `git filter-branch` or BFG Repo-Cleaner to remove from git history

### Firebase Security Checklist:

- [ ] API key is in `.env` file (not in code)
- [ ] `.env` is in `.gitignore`
- [ ] Firebase project has proper security rules
- [ ] Authentication is properly configured
- [ ] Domain restrictions are set up

### Emergency Contact:

If you discover a security vulnerability, please:
1. Revoke any exposed credentials immediately
2. Create new credentials
3. Update all environment variables
4. Review git history for other potential exposures
