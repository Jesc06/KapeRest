# API Handler Usage Guide

This project now uses a centralized API handler that automatically manages authentication and authorization errors.

## Features

- **Automatic 401 Handling**: Redirects to login page when token expires
- **Automatic 403 Handling**: Redirects to unauthorized page when insufficient permissions
- **Token Management**: Automatically includes Bearer token in requests
- **Error Handling**: Consistent error handling across all API calls

## Usage Examples

### Basic Import

```typescript
import { apiGet, apiPost, apiPut, apiDelete, handleApiResponse } from '../../utils/apiHandler';
```

### GET Request

```typescript
// Old way (DON'T USE)
const response = await fetch(`${API_BASE_URL}/Branch/GetAllBranch`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
if (!response.ok) throw new Error('Failed');
const data = await response.json();

// New way (USE THIS)
const response = await apiGet('/Branch/GetAllBranch');
const data = await handleApiResponse(response);
```

### POST Request

```typescript
// Old way (DON'T USE)
const response = await fetch(`${API_BASE_URL}/RegisterPendingAccount/ApprovePendingAccount/${id}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dataToSend),
});
if (!response.ok) throw new Error('Failed');

// New way (USE THIS)
const response = await apiPost(`/RegisterPendingAccount/ApprovePendingAccount/${id}`, dataToSend);
await handleApiResponse(response);
```

### PUT Request

```typescript
const response = await apiPut('/User/UpdateProfile', updatedData);
const result = await handleApiResponse(response);
```

### DELETE Request

```typescript
const response = await apiDelete(`/Branch/Delete/${id}`);
await handleApiResponse(response);
```

## Error Handling

The API handler automatically handles:

- **401 Unauthorized**: Session expired → Redirects to `/login`
- **403 Forbidden**: Insufficient permissions → Redirects to `/unauthorized`
- **Network errors**: Shows appropriate error message

You still need to handle business logic errors:

```typescript
try {
  const response = await apiGet('/SomeEndpoint');
  const data = await handleApiResponse(response);
  // Process data
} catch (error) {
  // Handle business logic errors
  console.error('Error:', error);
  setError(error.message);
}
```

## Benefits

1. **Less Code**: No need to manually check tokens or add Authorization headers
2. **Consistent**: All API calls behave the same way
3. **Secure**: Automatic redirect on auth/authz failures
4. **Maintainable**: Changes to auth logic only need to be made in one place

## Migration Checklist

When updating existing components:

1. ✅ Import the API handlers
2. ✅ Replace `fetch()` calls with `apiGet/apiPost/apiPut/apiDelete`
3. ✅ Remove manual token checking (`localStorage.getItem('accessToken')`)
4. ✅ Remove manual Authorization header setup
5. ✅ Replace `response.json()` with `handleApiResponse(response)`
6. ✅ Remove manual 401/403 status checks
